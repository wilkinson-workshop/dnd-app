
import abc, asyncio, functools, json, typing, uuid

from fastapi import WebSocket
from fastapi.websockets import WebSocketState
from starlette.datastructures import QueryParams

from scryer.creatures import CharacterV2, Creature, Role
from scryer.services.brokers import Broker, ShelfBroker, MemoryBroker
from scryer.services.creatures import CreaturesMemoryBroker
from scryer.services.service import Service, ServiceStatus
from scryer.util import UUID, request_uuid
from scryer.util.events import Event

# Special types used only in `Session` specific
# implementations.
type ActionResult[C: WebSocket] = tuple[C, int]
"""
Result from a session action. Returns the
connection and the number of bytes written to it.
"""
type ActionAwaitable[C: WebSocket] = typing.Coroutine[None, None, ActionResult[C]]
"""Awaitable `Action` type."""
type Action[C, **P] = typing.Callable[typing.Concatenate[C, P], ActionAwaitable]
"""
An invokable action which modifies a client
connection.
"""


class SessionSocketParams(typing.TypedDict):
    """
    Represents query parameters from a socket
    connection.
    """

    client_uuid: UUID
    role:        Role


class SessionSocket(WebSocket):
    """
    Purely representative type. Used to override
    properties of `WebSocket` to more clearly
    define what we should expecte from the object.
    """

    @property
    def query_params(self) -> SessionSocketParams:
        return super().query_params


def event_action[C: SessionSocket, **P](action: Action[C, P]) -> Action[C, P]:
    """
    Wrap or decorate an action to only run if the
    action is event based.
    """

    @functools.wraps(action)
    async def inner(client: C, event: Event, *args, **kwds):
        # Only filters if 'send_to' is a truthy
        # collection of UUIDs.
        send_to     = event.send_to
        client_uuid = request_uuid(client.query_params["client_uuid"])
        if send_to and client_uuid not in send_to:
            return client, 0
        return (await action(client, event, *args, **kwds))

    return inner


def roled_action[C: SessionSocket, **P](
        action: Action[C, P] | None = None,
        *,
        roles: typing.Sequence[Role]) -> Action[C, P]:
    """
    Wrap or decorate an action to only run if the
    client `Role` matches the declared role(s).
    """

    def wrapper(inner_action: Action[C, P]):

        @functools.wraps(inner_action)
        async def inner(client: C, *args, **kwds):
            if client.query_params['role'] not in roles:
                return client, 0
            return (await inner_action(client, *args, **kwds))

        return inner

    if action:
        return wrapper(action)
    return wrapper


async def send_event_action[C: SessionSocket](sock: C, event: Event):
    """
    Generic action which sends an event to a
    client connection
    """

    dump = event.model_dump()
    if "event_body" in dump and not dump["event_body"]:
        # Event body was empty. Most likely due to
        # an issue with model inheritence.
        event_body = event.event_body.model_dump()
        if isinstance(event_body, dict) and "client_uuids" in event_body:
            event_body["client_uuids"] = [
                str(u) for u in event_body["client_uuids"]
            ]
        dump["event_body"] = event_body

    await sock.send_text(json.dumps(dump))
    return sock, len(dump)


@event_action
@roled_action(roles=[Role.DUNGEON_MASTER])
async def dm_send_event_action[C: SessionSocket](
        sock: C,
        event: Event):
    """
    Send an event action to the dungeon master.
    """

    return (await send_event_action(sock, event))


@event_action
@roled_action(roles=[Role.PLAYER])
async def pc_send_event_action[C: SessionSocket](sock: C, event: Event):
    """
    Send an event action to the dungeon master.
    """

    return (await send_event_action(sock, event))


class Session[C: WebSocket](Service):
    """
    Active session that manages connections and
    action requests available to users.
    """

    # Set is an array of hashable objects that are
    # unique. Much like a mathematical set.
    _clients: dict[UUID, C]

    @classmethod
    @abc.abstractmethod
    def new_instance(cls) -> typing.Self:
        """Creates a new session instance."""

    @property
    def session_uuid(self) -> UUID:
        """Identity of this session."""

        return uuid.UUID()

    @property
    def clients(self) -> dict[UUID, C]:
        """Active client connections."""

        return self._clients

    async def attach_client(self, client: C) -> UUID:
        """Process a `connect` request."""

        query_params = dict()
        query_params["client_uuid"] = request_uuid()
        # QueryParams objects are immutable and
        # not cloneable. For whatever reason,
        # WebSockets tries to enforce this while
        # hiding behind a property attr.
        #
        # This is barbaric, and not best practice,
        # but it's what we are going with for now.
        for key, value in client.query_params.items():
            query_params[key] = value

        client._query_params = QueryParams(query_params)
        self.clients[query_params["client_uuid"]] = client
        return query_params["client_uuid"]

    # TODO: Find different verboge for filtered
    # action sending.
    async def broadcast_action[**P](
            self,
            action: Action[C, P], **kwds) -> typing.Sequence[ActionResult]:
        """
        Do an action against all connections.
        Returns the number of bytes sent to each
        client.
        """

        async with asyncio.TaskGroup() as tg:
            results = [
                tg.create_task(self.do_action(c, action, **kwds))
                for c in self.clients.values()
            ]

        return tuple(results)

    async def delete(self):
        """
        Stop all connections and perform any
        required cleanup.
        """

        async with asyncio.TaskGroup() as tg:
            [
                tg.create_task(self.detach_client(c))
                for c in self.clients.values()
            ]
        self.clients.clear()

    async def detach_client(self, client: C):
        """Disconnect a client."""

        client_uuid = [ # This will throw an index
                        # error if the client
                        # doesn't exist.
            cuid for cuid, c in self.clients.items() if c is client][0]

        client = self.clients.pop(client_uuid)
        if client.client_state is WebSocketState.DISCONNECTED:
            return
        await client.close()

    async def do_action[**P](
            self,
            client: C,
            action: Action[C, P], **kwds) -> ActionResult:
        """
        Serve an action to the target client
        connection.
        """

        if client.client_state is WebSocketState.DISCONNECTED:
            await self.detach_client(client)
            return client, 0
        return (await action(client, **kwds)) #type: ignore


class CombatSession[C: SessionSocket](Session[C]):
    _session_uuid: UUID
    _characters:   Broker[UUID, Creature]

    @classmethod
    def new_instance(cls) -> typing.Self:
        inst = cls()
        inst._session_uuid = request_uuid()
        inst._clients      = dict()
        inst._characters   = CreaturesMemoryBroker(CharacterV2)
        return inst

    @property
    def characters(self) -> Broker[UUID, Creature]:
        return self._characters

    @property
    def session_uuid(self) -> UUID:
        return self._session_uuid
    
    @property
    def status(self) -> ServiceStatus:
        stats       = [st.status for st in (self.characters,)]
        valid_stats = (ServiceStatus.ACTIVE, ServiceStatus.ONLINE)
        validator   = lambda fn: fn((stat in valid_stats for stat in stats))
        
        if validator(all):
            return ServiceStatus.ONLINE
        if validator(any):
            return ServiceStatus.FAILING
        return ServiceStatus.OFFLINE


class SessionMemoryBroker(MemoryBroker[UUID, Session]):
    """
    Implementation of `MemoryBroker` for storing
    and maintaining `Session` objects.
    """

    async def create(self):
        session      = self.resource_cls.new_instance()
        session_uuid = session.session_uuid
        self.resource_map[session_uuid] = session
        return (session_uuid, session)

    async def modify(self, key: UUID, resource: Session):
            self.resource_map[key] = resource


class SessionShelver(ShelfBroker[Session]):
    """
    Implementation of `SessionBroker` which stores
    session data using the `shelve` module.

    This allows data to be stored persistently,
    but in a way that can be accessed at runtime
    as if it were in-memory. This would be similar
    to how we'd want our application to behave in
    production, but easier to manipulate in
    development.
    """

    async def create(self) -> tuple[str, Session]:
        session      = self.resource_cls.new_instance()
        session_uuid = str(session.session_uuid)
        with self as opened:
            opened.shelf[session_uuid] = session
        return (session_uuid, session)

    async def modify(self, key: str, resource: Session):
        with self as opened:
            opened.shelf[key] = resource

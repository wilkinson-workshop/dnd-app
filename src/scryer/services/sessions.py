
import abc, asyncio, functools, json, typing, uuid

from fastapi import WebSocket
from fastapi.websockets import WebSocketState
from starlette.datastructures import QueryParams

from scryer.creatures import CharacterV2, Creature, CreatureV2, Role
from scryer.services.brokers import (
    Broker,
    ShelfBroker,
    MemoryBroker,
    RedisBroker
)
from scryer.services.creatures import CreaturesMemoryBroker
from scryer.services.service import Service, ServiceStatus
from scryer.services.sockets import SessionSocket, SocketBroker
from scryer.util import UUID, request_uuid
from scryer.util.events import Event

# Special types used only in `Session` specific
# implementations.
type ActionResult = tuple[WebSocket, int]
"""
Result from a session action. Returns the
connection and the number of bytes written to it.
"""
type ActionAwaitable = typing.Coroutine[None, None, ActionResult]
"""Awaitable `Action` type."""
type Action[**P] = typing.Callable[typing.Concatenate[WebSocket, P], ActionAwaitable]
"""
An invokable action which modifies a client
connection.
"""


def event_action[**P](action: Action[P]) -> Action[P]:
    """
    Wrap or decorate an action to only run if the
    action is event based.
    """

    @functools.wraps(action)
    async def inner(client: WebSocket, event: Event, *args, **kwds):
        # Only filters if 'send_to' is a truthy
        # collection of UUIDs.
        send_to     = event.send_to
        client_uuid = request_uuid(client.query_params["client_uuid"])
        if send_to and client_uuid not in send_to:
            return client, 0
        return (await action(client, event, *args, **kwds)) #type: ignore

    return inner #type: ignore


@typing.overload
def roled_action[**P](
    *,
    roles: typing.Sequence[Role]) -> typing.Callable[[Action[P]], Action[P]]:
    pass
@typing.overload
def roled_action[**P](
    action: Action[P], *, roles: typing.Sequence[Role]) -> Action[P]:
    pass
def roled_action[**P]( #type: ignore
        action: Action[P] | None = None,
        *,
        roles: typing.Sequence[Role]):
    """
    Wrap or decorate an action to only run if the
    client `Role` matches the declared role(s).
    """

    def wrapper(inner_action: Action[P]) -> Action[P]:

        @functools.wraps(inner_action)
        async def inner(client, *args, **kwds):
            if client.query_params['role'] not in roles:
                return client, 0
            return (await inner_action(client, *args, **kwds))

        return inner #type: ignore

    if action:
        return wrapper(action)
    return wrapper


async def send_event_action(sock: WebSocket, event: Event) -> ActionResult:
    """
    Generic action which sends an event to a
    client connection
    """

    dump = event.model_dump()
    if "event_body" in dump and not dump["event_body"]:
        # Event body was empty. Most likely due to
        # an issue with model inheritence.
        event_body = event.event_body.model_dump() #type: ignore
        if isinstance(event_body, dict) and "client_uuids" in event_body:
            event_body["client_uuids"] = [
                str(u) for u in event_body["client_uuids"]
            ]
        dump["event_body"] = event_body

    await sock.send_text(json.dumps(dump))
    return sock, len(dump)


@event_action
@roled_action(roles=[Role.DUNGEON_MASTER])
async def dm_send_event_action(
        sock: WebSocket,
        event: Event) -> ActionResult:
    """
    Send an event action to the dungeon master.
    """

    return (await send_event_action(sock, event))


@event_action
@roled_action(roles=[Role.PLAYER])
async def pc_send_event_action(
    sock: WebSocket,
    event: Event) -> ActionResult:
    """
    Send an event action to the dungeon master.
    """

    return (await send_event_action(sock, event))


class Session[C: SessionSocket](Service):
    """
    Active session that manages connections and
    action requests available to users.
    """

    # Set is an array of hashable objects that are
    # unique. Much like a mathematical set.
    _clients: SocketBroker

    @classmethod
    @abc.abstractmethod
    def from_mapping(
            cls,
            inst: typing.Mapping[str, typing.Any],
            *,
            client_broker: SocketBroker | None = None) -> typing.Self:
        """
        Digest a mapping representation into a
        session instance.
        """

    @classmethod
    @abc.abstractmethod
    def into_mapping(cls, inst: typing.Self) -> typing.Mapping[str, typing.Any]:
        """
        Digest a session instance into a mapping
        representation.
        """

    @classmethod
    @abc.abstractmethod
    def new_instance(cls, client_broker: SocketBroker) -> typing.Self:
        """Creates a new session instance."""

    @property
    def session_uuid(self) -> UUID:
        """Identity of this session."""

        return uuid.UUID()

    @property
    def clients(self) -> SocketBroker:
        """Active client connections."""

        return self._clients

    async def attach_client(self, client: C) -> UUID:
        """Process a `connect` request."""

        client_uuid = (await self.clients.create(client))[0]
        client.cookies["session_uuid"] = self.session_uuid
        return client_uuid

    # TODO: Find different verboge for filtered
    # action sending.
    async def broadcast_action[**P](
            self,
            action: Action[P], **kwds) -> typing.Sequence[ActionResult]:
        """
        Do an action against all connections.
        Returns the number of bytes sent to each
        client.
        """

        filter_statement = {
            "logic": "and",
            "rules": [
                {
                    "field": "session_uuid",
                    "operator": "eq",
                    "value": self.session_uuid
                }
            ]
        }
        found = await self.clients.locate(statement=filter_statement) # type: ignore

        async with asyncio.TaskGroup() as tg:
            results = [
                tg.create_task(self.do_action(c, action, **kwds)) #type: ignore
                for _, c in found
            ]

        return tuple([r.result() for r  in results])

    async def delete(self):
        """
        Stop all connections and perform any
        required cleanup.
        """

        filter_statement = {
            "logic": "and",
            "rules": [
                {
                    "field": "session_uuid",
                    "operator": "eq",
                    "value": self.session_uuid
                }
            ]
        }
        found = await self.clients.locate(statement=filter_statement) #type: ignore

        async with asyncio.TaskGroup() as tg:
            [
                tg.create_task(self.detach_client(c)) #type: ignore
                for _, c in found
            ]

    async def detach_client(self, client: C):
        """Disconnect a client."""

        filter_statement = {
            "logic": "and",
            "rules": [
                {
                    "field": "session_uuid",
                    "operator": "eq",
                    "value": self.session_uuid
                }
            ]
        }
        found = await self.clients.locate(statement=filter_statement) #type: ignore
        client_uuid = [ # This will throw an index
                        # error if the client
                        # doesn't exist.
            cuid for cuid, c in found if c is client][0]

        await self.clients.delete(client_uuid)
        if client.client_state is WebSocketState.DISCONNECTED:
            return
        await client.close()

    async def do_action[**P](
            self,
            client: C,
            action: Action[P], **kwds) -> ActionResult:
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
    _events:       typing.MutableSequence[Event]

    @classmethod
    def new_instance(cls, client_broker: SocketBroker) -> typing.Self:
        inst = cls()
        inst._session_uuid = request_uuid()
        inst._clients      = client_broker
        inst._characters   = CreaturesMemoryBroker(CharacterV2)
        inst._events       = []
        return inst

    @property
    def characters(self) -> Broker[UUID, Creature]:
        return self._characters

    @property
    def events(self) -> typing.MutableSequence[Event]:
        return self._events

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

    async def attach_client(self, client: C) -> UUID:
        ch: CreatureV2
        client_uuid = await super().attach_client(client)
        if client.query_params["role"] is Role.DUNGEON_MASTER:
            return client_uuid

        if (found := await self.characters.locate(client_uuid)): #type: ignore
            _, ch = found[0] #type: ignore
            ch.creature_id = client_uuid
        else:
            # Pylance is refusing to admit
            # CharacterV2 is a child of Creature.
            ch = CharacterV2(
                conditions=[], # type: ignore
                hit_points=client.query_params.get("hit_points", None), # type: ignore
                creature_id=client_uuid, # type: ignore
                initiative=0, # type: ignore
                role=client.query_params.get("role", Role.NON_PLAYER), # type: ignore
                name=client.query_params.get("name", "nameless") # type: ignore
            )

        await self.characters.modify(client_uuid, ch) #type: ignore
        return client_uuid


class SessionMemoryBroker(MemoryBroker[UUID, Session]):
    """
    Implementation of `MemoryBroker` for storing
    and maintaining `Session` objects.
    """

    @typing.override
    async def create(self, client_broker: SocketBroker):
        session      = self.resource_cls.new_instance(client_broker)
        session_uuid = session.session_uuid
        self.resource_map[session_uuid] = session
        return (session_uuid, session)


class SessionRedisBroker(RedisBroker[UUID, Session]):
    """
    Implementation of `RedisBroker` for
    manipulating `Session` objects from a
    semi-persistent state.
    """

    @typing.override
    async def create(self, client_broker: SocketBroker):
        session      = self.resource_cls.new_instance(client_broker)
        session_uuid = session.session_uuid

        rkey = f"{self.resource_cls.__name__}:{session_uuid!s}"
        rdat = json.dumps(session.into_mapping(session))
        self.redis_client.set(rkey, rdat)
        return (session_uuid, session)

    async def modify(self, key: UUID, resource: Session):
        rkey = f"{self.resource_cls.__name__}:{resource.session_uuid!s}"
        rdat = json.dumps(resource.into_mapping(resource))
        self.redis_client.set(rkey, rdat)


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

    @typing.override
    async def create(self, client_broker: SocketBroker) -> tuple[str, Session]:
        session      = self.resource_cls.new_instance(client_broker)
        session_uuid = str(session.session_uuid)
        with self as opened:
            opened.shelf[session_uuid] = session
        return (session_uuid, session)

    async def modify(self, key: str, resource: Session):
        with self as opened:
            opened.shelf[key] = resource

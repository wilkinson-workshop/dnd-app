
import abc, asyncio, functools, json, typing, uuid
from typing import Any, Mapping

from fastapi import WebSocket
from fastapi.websockets import WebSocketState
from pydantic import BaseModel
from starlette.datastructures import QueryParams

from scryer.creatures import CharacterV2, Creature, CreatureV2, Role
from scryer.services import (
    Broker,
    EventBroker,
    MemoryBroker,
    RedisBroker,
    ShelfBroker
)
from scryer.services.creatures import CreaturesMemoryBroker
from scryer.services.service import Service, ServiceStatus
from scryer.services.sockets import SessionSocket, SocketBroker
from scryer.util import UUID, request_uuid
from scryer.util.events import (
    Event,
    EventBody,
    ReceiveRoll,
    SessionJoinBody,
    dump_event
)
from scryer.util.filters import FilterStatement, LogicalOp

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

class SessionApi(BaseModel):
    session_uuid: UUID
    session_name: str
    session_description: str


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
        client_uuid = request_uuid(client.cookies["client_uuid"])
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
            if client.cookies['role'] not in roles:
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

    dump = dump_event(event)
    await sock.send_json(dump)
    return sock, len(dump)

@event_action
async def all_send_event_action(
        sock: WebSocket,
        event: Event) -> ActionResult:
    """
    Send an event action to the all clients.
    """

    return (await send_event_action(sock, event))

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
    Send an event action to the players.
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
    def new_instance(
            cls,
            name: str,
            client_broker: SocketBroker,
            event_broker: EventBroker,
            description: str | None = None) -> typing.Self:
        """Creates a new session instance."""

    
    @property 
    def session_description(self) -> str:
        """ 
        Describes the session in more detail. 
        """

        return ""
    
    @property 
    def session_name(self) -> str: 
        """ 
        Human readable identity of this session. 
        """

        return f"{type(self).__name__}:{self.session_uuid!s}"

    @property
    def session_uuid(self) -> UUID:
        """Identity of this session."""

        return uuid.UUID()

    @property
    def clients(self) -> SocketBroker:
        """Active client connections."""

        return self._clients

    async def attach_client(self, client: C, body: SessionJoinBody) -> UUID:
        """Process a `connect` request."""

        client_uuid = request_uuid(body['client_uuid'])
        found = await self.clients.locate(client_uuid)

        if client_uuid and found:
            # Throw out the old client and replace 
            # it with the new client. 
            await self.detach_client(found[0][1]) #type: ignore 
            await self.clients.modify(client_uuid, client)
        else:
            #Create a new client if no existing 
            # client uuid is found.
            client.cookies["client_uuid"]  = client_uuid
            client_uuid = (await self.clients.create(client))[0]  

        # Storing in extra information in cookies 
        # as a mutable mapping for future 
        # validation and lookup.
        client.cookies["session_uuid"] = self.session_uuid
        client.cookies["name"] = body['name']
        client.cookies["role"] = body['role']

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

        found = await self.clients.locate(statement=_filter_statement_client(self)) # type: ignore

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

        found = await self.clients.locate(statement=_filter_statement_client(self)) #type: ignore

        async with asyncio.TaskGroup() as tg:
            [
                tg.create_task(self.detach_client(c)) #type: ignore
                for _, c in found
            ]

    async def detach_client(self, client: C):
        """Disconnect a client."""

        found = await self.clients.locate(statement=_filter_statement_client(self)) #type: ignore
        client_uuids = [cuid for cuid, c in found if c is client]
        if not client_uuids:
            return

        await self.clients.delete(client_uuids[0])
        if client.client_state is WebSocketState.DISCONNECTED:
            return
        await client.close()

    async def do_action[**P](
            self,
            client: C,
            action: Action[P], 
            *_: P.args,
            **kwds: P.kwargs) -> ActionResult:
        """
        Serve an action to the target client
        connection.
        """

        if client.client_state is WebSocketState.DISCONNECTED:
            await self.detach_client(client)
            return client, 0
        
        try: 
            ret = await action(client, **kwds) #type: ignore 
        except Exception as e: 
            print(e) 
            ret = client, 0 
        finally: 
            return ret


def _filter_statement_client[C: SessionSocket](session: Session[C]):
    return {
            "logic": "and",
            "filters": [
                {
                    "field": "cookies.session_uuid",
                    "operator": "eq",
                    "value": session.session_uuid
                }
            ]
        }


def _filter_statement_event[C: SessionSocket](session: Session[C]):
    return {
            "logic": "and",
            "filters": [
                {
                    "field": "session_uuid",
                    "operator": "eq",
                    "value": session.session_uuid
                }
            ]
        }


class CombatSession[C: SessionSocket](Session[C]):
    _session_uuid:        UUID
    _session_name:        str | None
    _session_description: str | None
    _session_current_character: UUID | None

    _characters:          Broker[UUID, Creature]
    _events:              Broker[UUID, Event]

    @classmethod
    def new_instance(
            cls,
            name: str,
            client_broker: SocketBroker,
            event_broker: EventBroker,
            description: str | None = None,
            current_character: UUID | None = None) -> typing.Self:

        inst = cls()
        inst._session_description = description
        inst._session_uuid = request_uuid()
        inst._session_name = name
        inst._session_current_character = current_character

        inst._clients      = client_broker
        inst._characters   = CreaturesMemoryBroker(CharacterV2)
        inst._events       = event_broker
        return inst

    @property
    def characters(self) -> Broker[UUID, Creature]:
        return self._characters

    @property
    def events(self) -> Broker[UUID, Event]:
        return self._events

    @property
    def session_description(self) -> str: 
        return self._session_description or ""
    
    @property 
    def session_name(self) -> str: 
        default_name = f"{type(self).__name__}:{self.session_uuid!s}" 
        return self._session_name or default_name

    @property
    def session_uuid(self) -> UUID:
        return self._session_uuid
    
    @property
    def session_current_character(self) -> UUID | None:
        return self._session_current_character
    
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

    async def attach_client(self, client: C, body: SessionJoinBody) -> UUID:
        body['client_uuid'] = request_uuid()

        statement: FilterStatement = {
            'filters': [{ 
				'field': 'name', 
				'operator': LogicalOp.EQ, 
				'value': body['name'] 
			},{ 
				'field': 'role', 
				'operator': LogicalOp.EQ, 
				'value': body['role'] 
			}], 
			'logic': LogicalOp.AND }
        
        # attempt to match the character name on rejoin 
        # this does not work for DM as they are not in the character list
        if (found_name := await self.characters.locate(statement=statement)):
            ch: CreatureV2
            _, ch = found_name[0]
            body["client_uuid"] = ch.creature_id


        client_uuid = await super().attach_client(client, body)

        if body["role"] == Role.DUNGEON_MASTER:
            return client_uuid    

        if (found := await self.characters.locate(client_uuid)): #type: ignore
            ch: CreatureV2
            _, ch = found[0] #type: ignore
            ch.creature_id = client_uuid
            await self.characters.modify(client_uuid, ch) #type: ignore
        else:
            # Pylance is refusing to admit
            await self.characters.create(
                conditions=[], # type: ignore
                hit_points=[100, 100], # type: ignore
                creature_id=client_uuid, # type: ignore
                initiative=0, # type: ignore
                role=body["role"], # type: ignore
                name=body["name"], # type: ignore
                monster=None #type: ignore
            )

        return client_uuid

    async def owned_events(self):
        statement: FilterStatement = _filter_statement_event(self) #type: ignore
        return (await self.events.locate(statement=statement))
    
    def set_current_character(self, new_current_character: UUID):
        self._session_current_character = new_current_character


class SessionMemoryBroker(MemoryBroker[UUID, Session]):
    """
    Implementation of `MemoryBroker` for storing
    and maintaining `Session` objects.
    """

    @typing.override
    async def create(
            self,
            name: str,
            client_broker: SocketBroker,
            event_broker: EventBroker,
            description: str | None = None):

        session = self.resource_cls.new_instance(
            name,
            client_broker,
            event_broker,
            description)
        
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
    async def create(
            self,
            name: str,
            client_broker: SocketBroker,
            event_broker: EventBroker,
            description: str | None = None):

        session = self.resource_cls.new_instance(
            name, 
            client_broker,
            event_broker,
            description)
        
        session_uuid = session.session_uuid

        rkey = f"{self.resource_cls.__name__}:{session_uuid!s}"
        # TODO: into_mapping is not defined, nor 
        # implemented.
        rdat = json.dumps(session.into_mapping(session))
        self.redis_client.set(rkey, rdat)
        return (session_uuid, session)

    async def modify(self, key: UUID, resource: Session):
        rkey = f"{self.resource_cls.__name__}:{resource.session_uuid!s}"
        # TODO: into_mapping is not defined, nor 
        # implemented.
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
    async def create(
            self,
            name: str,
            client_broker: SocketBroker,
            event_broker: EventBroker,
            description: str | None = None):

        session = self.resource_cls.new_instance(
            name,
            client_broker, 
            event_broker,
            description)
        
        session_uuid = str(session.session_uuid)
        with self as opened:
            opened.shelf[session_uuid] = session
        return (session_uuid, session)

    async def modify(self, key: str, resource: Session):
        with self as opened:
            opened.shelf[key] = resource

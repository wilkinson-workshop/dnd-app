
import abc, asyncio, typing, uuid

from fastapi import WebSocket

from scryer.creatures import CharacterV2, Creature
from scryer.services.brokers import Broker, ShelfBroker, MemoryBroker
from scryer.services.creatures import CreaturesMemoryBroker
from scryer.services.service import Service, ServiceStatus
from scryer.util import UUID, request_uuid
from scryer.util.asyncit import _aiter

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

        client_uuid = request_uuid()
        self.clients[client_uuid] = client
        return client_uuid

    async def broadcast_action[**P](self, action: Action[C, P]) -> typing.Sequence[ActionResult]:
        """
        Do an action against all connections.
        Returns the number of bytes sent to each
        client.
        """

        actions = asyncio.Queue()
        async for client in _aiter(self.clients):
            await actions.put(await self.do_action(client, action))

        results = []
        while actions.qsize():
            results.append(actions.get_nowait())

        return tuple(results)

    async def delete(self):
        """
        Stop all connections and perform any
        required cleanup.
        """

        async for client in _aiter(self.clients.values()):
            await self.detach_client(client)
        self.clients.clear()

    async def detach_client(self, client_uuid: UUID):
        """Disconnect a client."""

        client = self.clients.pop(client_uuid)
        await client.close()

    async def do_action[**P](self, client: C, action: Action[C, P], **kwds) -> ActionResult:
        """
        Serve an action to the target client
        connection.
        """

        return (await action(client, **kwds)) #type: ignore


class CombatSession(Session):
    _session_uuid: UUID
    _characters:    Broker[UUID, Creature]

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
        return ServiceStatus.ACTIVE


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

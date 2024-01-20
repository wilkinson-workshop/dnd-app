
import abc, asyncio, typing, uuid

from fastapi import WebSocket

from scryer.services.brokers import ShelfBroker
from scryer.services.service import Service, ServiceStatus
from scryer.util.asyncit import _aiter

# Special types used only in `Session` specific
# implementations.
type ActionResult[C] = tuple[C, int]
"""
Result from a session action. Returns the
connection and the number of bytes written to it.
"""
type ActionAwaitable[C] = typing.Coroutine[ActionResult[C], None, None]
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
    __clients: set[C]

    @classmethod
    @abc.abstractmethod
    def new_instance(cls) -> typing.Self:
        """Creates a new session instance."""

    @property
    def label(self) -> str:
        """Identity of this session."""

        return "00000000-0000-0000-0000-000000000000"

    @property
    def clients(self) -> typing.Sequence[C]:
        """Active client connections."""

        return tuple(self.__clients)

    async def attach_client(self, client: C):
        """Process a `connect` request."""

        await client.accept()
        self.__clients.add(client)

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

        async for client in _aiter(self.clients):
            await self.detach_client(client)
        self.__clients.clear()

    async def detach_client(self, client: C):
        """Disconnect a client."""

        await client.close()

    @abc.abstractmethod
    async def do_action[**P](self, client: C, action: Action[C, P], **kwds) -> ActionResult:
        """
        Serve an action to the target client
        connection.
        """

        return (await action(client, **kwds)) #type: ignore


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
        # TODO: move to a separate function.
        session = self.resource_cls.new_instance()
        key     = str(uuid.uuid1())

        with self as opened:
            opened.shelf[key] = session
        return (key, session)

    async def modify(self, key: str, resource: Session):
        with self as opened:
            opened.shelf[key] = resource

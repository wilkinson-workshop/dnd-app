"""
Python bound objects that represent some service
or task this application depends on.
"""

import abc
import enum
import typing

from scryer import shelves


class ServiceStatus(enum.StrEnum):
    """
    The status type of an individual service.
    """

    ACTIVE  = "active"
    """Service is online and currently running."""

    BUSY = "busy"
    """
    Service is online, but cannot be reached due
    to being preoccupied.
    """

    OFFLINE = "offline"
    """
    Either the service, its host, or both are
    unavailable.
    """

    ONLINE = "online"
    """The service is online and available."""

    UNAVAILABLE = "unavailable"
    """
    The service host can be pinged, but the
    service itself cannot be reached.
    """


class Service(typing.Protocol):
    """
    An external data source, task or subprocess
    """

    @property
    @abc.abstractmethod
    def status(self) -> ServiceStatus:
        """The current status of the service."""


class Broker[K, R](Service):
    """
    Manages, or maintains, some resource.
    Typically used for brokering in-memory
    objects.
    """

    @abc.abstractmethod
    def create(self) -> tuple[K, R]:
        """Create a new resource instance."""
    @abc.abstractmethod
    def delete(self, key: R) -> None:
        """
        Delete a resource related to the key.
        """
    @abc.abstractmethod
    def locate(self, *keys: R) -> typing.Sequence[tuple[K, R]]:
        """
        Attempt to find resources that are related
        to the given keys.
        """
    # This is just syntactic sugar here, but it
    # helps us identify what inputs our method
    # should be allowed to accept. The method at
    # the bottom of this definition stack is what
    # will be enforced as what needs to be
    # implementend by lower objects.
    @typing.overload
    @abc.abstractmethod
    def modify(self, key: R, **kwds) -> None:
        pass
    @typing.overload
    @abc.abstractmethod
    def modify(self, key: R, resource: R) -> None:
        pass
    @abc.abstractmethod
    def modify(self, key: R, *args, **kwds) -> None:
        """
        Push changes to an existing resource.
        """


class ShelfBroker[R](Broker[str, R]):
    """
    A partial implementation of a broker which
    utilizes the `shelve` module to store
    resources persistently.
    """

    resource_cls: type[R]
    shelf:        shelves.Shelf

    def __init__(self, shelf_name: str, cls: type[R]) -> None:
        self.resource_cls = cls
        self.shelf_name   = shelf_name

    # `__enter__` and `__exit__` are special
    # methods in Python. They allow us to override
    # or extend built-in behaviors, and in this
    # case, allows us to use this class as a
    # context manager. This is where you'll see
    # the `with self` statements. Think of
    # `__enter__` as the setup and `__exit__` as
    # the teardown.
    def __enter__(self):
        self.shelf = shelves.open(self.shelf_name)
        return self

    def __exit__(self, *_):
        self.shelf.close() #type: ignore

    async def delete(self, key: str):
        with self as opened:
            opened.shelf.pop(key, None)

    async def locate(self, key: str) -> typing.Sequence[R]:
        with self as opened:
            return opened.shelf.get(key, None)

    async def status(self) -> str:
        return "online"


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


class Session[C](Service):
    """
    Active session that manages connections and
    action requests available to users.
    """

    @classmethod
    @abc.abstractmethod
    def new_instance(cls) -> typing.Self:
        """Creates a new session instance."""

    @property
    @abc.abstractmethod
    def label(self) -> str:
        """Identity of this session."""
    @property
    @abc.abstractmethod
    def clients(self) -> typing.Sequence[C]:
        """Active client connections."""

    @abc.abstractmethod
    async def attach_client(self, client: C):
        """Process a `connect` request."""
    @abc.abstractmethod
    async def broadcast_action[**P](self, action: Action[C, P]) -> typing.Sequence[ActionResult]:
        """
        Do an action against all connections.
        Returns the number of bytes sent to each
        client.
        """
    @abc.abstractmethod
    async def delete(self):
        """
        Stop all connections and perform any
        required cleanup.
        """
    @abc.abstractmethod
    async def detach_client(self, client: C):
        """Disconnect a client."""
    @abc.abstractmethod
    async def do_action[**P](self, client: C, action: Action[C, P]) -> ActionResult:
        """
        Serve an action to the target client
        connection.
        """

import enum
import typing
import uuid

try:
    # This module is potentially not implemented
    # depending on the platform and the packages
    # available to said system.
    import shelve
    SHELVE_IMPLEMENTED = True
except ImportError:
    SHELVE_IMPLEMENTED = False

from fastapi import WebSocket

type Action[C: WebSocket, **P] = typing.Callable[typing.Concatenate[C, P], typing.Coroutine[tuple[C, int]]]


class Condition(typing.NamedTuple):
    """
    A condition, or status effect, applicable to a
    creature.
    """

    name:        str
    description: str
    color:       int


class HitPoints(int):
    """
    Integer alias to represent **Hit Points**
    where an upper bound, and a lower bound value,
    is defined.
    """

    max_hitpoints: int
    min_hitpoints: int = 0

    def __new__(
            cls,
            max_hitpoints: int,
            min_hitpoints: int | None = None,
            current_hitpoints: int | None = None):

        if current_hitpoints:
            initial_hitpoints = current_hitpoints
        else:
            initial_hitpoints = max_hitpoints

        inst = super().__new__(initial_hitpoints) #type: ignore[call-overload]
        inst.max_hitpoints = max_hitpoints
        inst.min_hitpoints = min_hitpoints or cls.min_hitpoints

        return inst

    def __add__(self, other):
        return min(self + other, self.max_hitpoints)

    def __sub__(self, other):
        return max(self - other, self.min_hitpoints)


class Role(enum.StrEnum):
    """
    The role assigned to a player per session.
    """

    NON_PLAYER     = enum.auto()
    PLAYER         = enum.auto()
    DUNGEON_MASTER = enum.auto()


class User(typing.Protocol):
    @property
    def is_active(self) -> bool:
        """
        User is currently online and in a
        session.
        """
    @property
    def session(self) -> "Session":
        """`Session` user is connected to."""


class Creature(typing.Protocol):
    """
    A character, playable or non-playable, that is
    active in a game session.
    """

    @property
    def conditions(self) -> list[Condition]:
        """Active conditions on this creature."""
    @property
    def hit_points(self) -> HitPoints:
        """
        Returns the hit-points (HP) of this
        creature.
        """
    @property
    def is_player(self) -> bool:
        """
        Whether creater is a Player Character or a
        Non-Player Character.
        """
    @property
    def owner(self) -> User:
        """The user who 'owns' this creature."""

    def role(self, session: "Session") -> Role:
        """The role assigned to this creature."""


class Session[C: WebSocket](typing.Protocol):
    """
    Active session that manages connections and
    action requests available to users.
    """

    @classmethod
    def new_instance(cls) -> typing.Self:
        """Creates a new session instance."""

    @property
    def label(self) -> str:
        """Identity of this session."""
    @property
    def clients(self) -> typing.Sequence[C]:
        """Active client connections."""

    async def attach_client(self, client: C):
        """Process a `connect` request."""
    async def broadcast_action[**P](self, action: Action[C, P]) -> typing.Sequence[tuple[C, int]]:
        """
        Do an action against all connections.
        Returns the number of bytes sent to each
        client.
        """
    async def delete(self):
        """
        Stop all connections and perform any
        required cleanup.
        """
    async def detach_client(self, client: C):
        """Disconnect a client."""
    async def do_action[**P](self, client: C, action: Action[C, P]) -> tuple[C, int]:
        """
        Serve an action to the target client
        connection.
        """


class SessionBroker(typing.Protocol):
    """
    Maintains session information between this
    appliction and the data layer.
    """

    async def create(self) -> (str, Session):
        """
        Create a new `Session` instance, record
        meta to the data layer, then return it.
        """
    async def delete(self, label: str):
        """
        Deletes a `Session` from the data layer,
        if it exists, perform any required
        cleanup.
        """
    async def locate(self, label: str) -> Session | None:
        """
        Attempt to locate a `Session` from the
        label.
        """
    async def status(self) -> str:
        """Connection status of this broker."""


class SessionShelver(SessionBroker):
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

    def __init__(self, shelf_name: str, cls: type[Session]):
        self.session_cls = cls
        self.shelf_name  = shelf_name
        self.shelf       = dict()

    # `__enter__` and `__exit__` are special
    # methods in Python. They allow us to override
    # or extend built-in behaviors, and in this
    # case, allows us to use this class as a
    # context manager. This is where you'll see
    # the `with self` statements. Think of
    # `__enter__` as the setup and `__exit__` as
    # the teardown.
    def __enter__(self):
        if SHELVE_IMPLEMENTED:
            self.shelf = shelve.open(self.shelf_name)
        return self

    def __exit__(self, *args):
        if SHELVE_IMPLEMENTED:
            self.shelf.close()
            self.shelf = None

    async def create(self) -> Session:
        # TODO: move to a separate function.
        session       = self.session_cls.new_instance()
        session_label = str(uuid.uuid1())
        with self:
            self.shelf[session_label] = session
        return (session_label, session)

    async def delete(self, label: str):
        with self:
            self.shelf.pop(label, None)

    async def locate(self, label: str) -> Session | None:
        with self:
            return self.shelf.get(label, None)

    async def status(self) -> str:
        return "online"

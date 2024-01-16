import asyncio
import enum
import typing

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


class PlayerRole(enum.StrEnum):
    """
    The role assigned to a player per session.
    """

    NON_PLAYER     = enum.auto()
    PLAYER         = enum.auto()
    DUNGEON_MASTER = enum.auto()


class User(typing.Protocol):
    def is_active(self) -> bool:
        """
        User is currently online and in a
        session.
        """
    def role(self, session: "Session") -> PlayerRole:
        """The role assigned to this player."""
    def session(self) -> "Session":
        """`Session` user is connected to."""


class Creature(typing.Protocol):
    """
    A character, playable or non-playable, that is
    active in a game session.
    """

    def conditions(self) -> list[Condition]:
        """Active conditions on this creature."""
    def hit_points(self) -> HitPoints:
        """
        Returns the hit-points (HP) of this
        creature.
        """
    def is_player(self) -> bool:
        """
        Whether creater is a Player Character or a
        Non-Player Character.
        """
    def owner(self) -> User:
        """The user who 'owns' this creature."""


class Session[C: WebSocket, **P](typing.Protocol):
    """
    Active session that manages connections and
    action requests available to users.
    """

    async def attach_client(self, client: C):
        """Process a `connect` request."""

    # [inline]
    async def broadcast_action(self, action: Action[C, P]) -> typing.Sequence[tuple[C, int]]:
        """
        Do an action against all connections.
        Returns the number of bytes sent to each
        client.
        """

        return await asyncio.gather(*[action(c) for c in self.clients()])

    def clients(self) -> typing.Sequence[C]:
        """Active client connections."""
    async def delete(self):
        """
        Stop all connections and perform any
        required cleanup.
        """
    async def detach_client(self, client: C):
        """Disconnect a client."""


class SessionBroker(typing.Protocol):
    """
    Maintains session information between this
    appliction and the data layer.
    """

    async def create(self) -> Session:
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

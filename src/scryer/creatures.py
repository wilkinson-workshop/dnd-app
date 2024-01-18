"""
Creature protocols and attributes. This includes
attribute types such as `Condition` and
`HitPoints`.
"""

import abc
import enum
import typing

from scryer.services import Session


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
    @abc.abstractmethod
    def is_active(self) -> bool:
        """
        User is currently online and in a
        session.
        """
    @property
    @abc.abstractmethod
    def session(self) -> "Session[typing.Any]":
        """`Session` user is connected to."""


class Creature(typing.Protocol):
    """
    A character, playable or non-playable, that is
    active in a game session.
    """

    @property
    @abc.abstractmethod
    def conditions(self) -> list[Condition]:
        """Active conditions on this creature."""
    @property
    @abc.abstractmethod
    def hit_points(self) -> HitPoints:
        """
        Returns the hit-points (HP) of this
        creature.
        """
    @property
    @abc.abstractmethod
    def is_player(self) -> bool:
        """
        Whether creater is a Player Character or a
        Non-Player Character.
        """
    @property
    @abc.abstractmethod
    def owner(self) -> User:
        """The user who 'owns' this creature."""

    @abc.abstractmethod
    def role(self, session: "Session") -> Role:
        """The role assigned to this creature."""

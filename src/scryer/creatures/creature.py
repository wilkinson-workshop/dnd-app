import abc, typing

from scryer.creatures.attrs import Condition, HitPoints, Role
from scryer.creatures.users import User

# A dummy type to represent the actual session
# object.
type Session[T] = object


class Creature(typing.Protocol):
    """
    A character, playable or non-playable, that is
    active in a game session.
    """

    @property
    @abc.abstractmethod
    def conditions(self) -> typing.Sequence[Condition]:
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
    def role(self, session: Session) -> Role:
        """The role assigned to this creature."""

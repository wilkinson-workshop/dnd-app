import abc, typing

from pydantic import ConfigDict, BaseModel, Field

from scryer.creatures.attrs import Condition, HitPoints, Role
from scryer.creatures.users import User
from scryer.util import UUID

# A dummy type to represent the actual session
# object.
type Session[T] = object


class CreatureMeta(type(typing.Protocol), type(BaseModel)):
    pass


class Creature(typing.Protocol):
    """
    A character, playable or non-playable, that is
    active in a game session.
    """

    @property
    @abc.abstractmethod
    def is_player(self) -> bool:
        """
        Whether creater is a Player Character or a
        Non-Player Character.
        """

    @abc.abstractmethod
    def role(self, session: Session) -> Role:
        """The role assigned to this creature."""


class CreatureModel(BaseModel):
    """
    Base creature model. Attributes of a playable
    or non-playable character.
    """


class CreatureModelV2(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    label:      UUID
    name:       str | None
    conditions: list[Condition]
    """Active conditions on this creature."""
    hit_points: HitPoints
    """
    Returns the hit-points (HP) of this
    creature.
    """
    initiative: int
    # owner: User | None
    # """The user who 'owns' this creature."""


class CreatureV2(CreatureModelV2, Creature, metaclass=CreatureMeta):
    """
    Shortcut class to subclass from both
    `Creature` protocol and `CreatureModel` class.
    """

import abc, typing

from pydantic import ConfigDict, BaseModel, Field

from scryer.creatures.attrs import Condition, HitPoints, Role
from scryer.util import UUID, request_uuid

import typing
if typing.TYPE_CHECKING:
    from scryer.services import Session
else:
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
    def creature_uuid(self) -> UUID:
        """
        The identifier associated with this
        creature.
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


class CreatureV1(CreatureModel, Creature, metaclass=CreatureMeta):
    id:         str	
    name:       str	
    hp:         int	
    maxHp:      int
    conditions: list[int]
    initiative: int
    type:       Role

    @property
    def creature_uuid(self):
        return request_uuid(self.id)


class CreatureV2(CreatureModel, Creature, metaclass=CreatureMeta):
    """
    Shortcut class to subclass from both
    `Creature` protocol and `CreatureModel` class.
    """

    conditions:  list[Condition]
    creature_id: UUID
    hit_points:  HitPoints
    initiative:  int
    name:        str | None

    @property
    def creature_uuid(self):
        return self.creature_id

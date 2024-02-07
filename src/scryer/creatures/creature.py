import abc, typing

from pydantic import ConfigDict, BaseModel, Field

from scryer.creatures.attrs import HitPoints, Role
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


class CreatureModel(BaseModel):
    """
    Base creature model. Attributes of a playable
    or non-playable character.
    """

class CreatureV2(CreatureModel, Creature, metaclass=CreatureMeta):
    """
    Shortcut class to subclass from both
    `Creature` protocol and `CreatureModel` class.
    """

    conditions:  list[str]
    creature_id: UUID
    hit_points:  HitPoints
    initiative:  int
    name:        str | None = None
    role:        Role = Role.NON_PLAYER

    @property
    def creature_uuid(self):
        return self.creature_id

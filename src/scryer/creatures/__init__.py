__all__ = (
    "Creature",
    "CreatureV2",
    "CreatureModel",
    "HitPoints",
    "Role",
    "User"
)

from pydantic import BaseModel
from scryer.creatures.attrs import HitPoints, Role
from scryer.creatures.creature import (
    Creature,
    CreatureV2,
    CreatureModel)
from scryer.creatures.users import User

import typing
if typing.TYPE_CHECKING:
    from scryer.services import Session
else:
    # A dummy type to represent the actual session
    # object.
    type Session[T] = object


class CharacterV2(CreatureV2):
    """A playable/non-playable creature."""

    @property
    def is_player(self):
        raise NotImplemented("TODO: impelment `is_player`")


class MutlipleCharactersV2(BaseModel):
    characters: list[CharacterV2]

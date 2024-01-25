__all__ = (
    "Creature",
    "CreatureV1",
    "CreatureV2",
    "CreatureModel",
    "Condition",
    "HitPoints",
    "Role",
    "User"
)

from scryer.creatures.attrs import Condition, HitPoints, Role
from scryer.creatures.creature import (
    Creature,
    CreatureV1,
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


class CharacterV1(CreatureV1):	

    @property
    def is_player(self):
        raise NotImplemented("TODO: impelment `is_player`")

    def role(self, session: Session):
        raise NotImplemented("TODO: implement `role`")


class CharacterV2(CreatureV2):
    """A playable/non-playable creature."""

    @property
    def is_player(self):
        raise NotImplemented("TODO: impelment `is_player`")

    def role(self, session: Session):
        raise NotImplemented("TODO: implement `role`")

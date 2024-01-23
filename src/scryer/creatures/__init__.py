__all__ = (
    "Creature",
    "CreatureBase",
    "CreatureMeta",
    "CreatureModel",
    "Condition",
    "HitPoints",
    "Role",
    "User"
)

from scryer.creatures.attrs import Condition, HitPoints, Role
from scryer.creatures.creature import (
    Creature,
    CreatureBase,
    CreatureMeta,
    CreatureModel)
from scryer.creatures.users import User

import typing
if typing.TYPE_CHECKING:
    from scryer.services import Session
else:
    # A dummy type to represent the actual session
    # object.
    type Session[T] = object


class Character(CreatureBase):
    """A playable/non-playable creature."""

    @property
    def is_player(self):
        raise NotImplemented("TODO: impelment `is_player`")

    def role(self, session: Session):
        raise NotImplemented("TODO: implement `role`")


class Monster(CreatureBase):
    """
    A non-playable creature that is potentially
    hostile in combat.
    """

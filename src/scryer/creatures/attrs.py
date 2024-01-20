import enum, typing


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

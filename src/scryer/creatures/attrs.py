import enum, math, typing


class Condition(typing.NamedTuple):
    """
    A condition, or status effect, applicable to a
    creature.
    """

    name:        str
    description: str
    color:       int


class HitPoints(typing.NamedTuple):
    """
    Integer alias to represent **Hit Points**
    where an upper bound, and a lower bound value,
    is defined.
    """

    type Self  = typing.Self
    type Other = Self | typing.SupportsFloat | typing.SupportsIndex | typing.SupportsInt

    current: int | float
    maximum: int | float = -1

    def try_maximum(self) -> int | float:
        """
        Conditionally returns 'infinity' if the
        maximum value was not specified.
        """

        if self.maximum == -1:
            return math.inf
        return self.maximum

    def __add__(self, other: Other) -> Self:
        change = HitPoints._parse_other_value(other)
        max_hp = self.try_maximum()
        return self._new(min(self.current + change, max_hp), max_hp)

    def __sub__(self, other: Other) -> Self:
        change = HitPoints._parse_other_value(other)
        min_hp = 0
        max_hp = self.maximum
        return self._new(max(self.current - change, min_hp), max_hp)

    @classmethod
    def _new(cls, current: int, maximum: int) -> Self:
        return cls(current, maximum)

    @staticmethod
    def _parse_other_value(other: Other) -> int | float:
        if isinstance(other, HitPoints):
            return other.current
        return other


class Role(enum.StrEnum):
    """
    The role assigned to a player per session.
    """

    # Reserved for internal usage of our
    # application.
    ADMINISTRATOR  = enum.auto()
    SESSION        = enum.auto()

    NON_PLAYER     = enum.auto()
    PLAYER         = enum.auto()
    DUNGEON_MASTER = enum.auto()

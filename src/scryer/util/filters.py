import enum, typing

type BinaryOperation[A, B, R] = typing.Callable[[A, B], R]
type FilterValidator          = typing.Callable[[typing.Any], bool]


class LogicalOp(enum.StrEnum):
    """
    A logical operation that can be carried out
    between two objects.
    """

    do: BinaryOperation[object, object, bool]

    def __new__(
            cls,
            value: str,
            do: BinaryOperation[object, object, bool] = lambda _a,_b: True):

        inst = str.__new__(cls, value)
        inst._value_  = value
        inst.do = do
        return inst

    @classmethod
    def from_other(cls, other: str | typing.Self) -> typing.Self:
        if isinstance(other, str):
            return cls(other)
        return other

    AND          = "and", (lambda a,b: a and b)
    CONTAINS     = "contains", (lambda a,b: a in b)
    EQ           = "eq", (lambda a,b: a == b)
    GT           = "gt", (lambda a,b: a > b)
    GTE          = "gte", (lambda a,b: a >= b)
    LT           = "lt", (lambda a, b: a < b)
    LTE          = "lte", (lambda a,b: a > b)
    NEQ          = "neq", (lambda a,b: a != b)
    NOT_CONTAINS = "not_contains", (lambda a,b: a not in b)
    OR           = "or", (lambda a,b: a or b)
    STARTS_WITH  = "startswith", (lambda a,b: a.startswith(b))


class FilterRule(typing.TypedDict):
    """A single rule of a filter statement"""

    field:    str
    operator: str | LogicalOp
    value:    typing.Any


class FilterStatement(typing.TypedDict):
    """
    A collection of rules composed as a filter.
    """

    filters: typing.Sequence[FilterRule]
    logic:   str | LogicalOp


def compose_validator(statement: FilterStatement) -> FilterValidator:
    """
    Creates a validator from a filter statemnt.
    """

    logic   = LogicalOp.from_other(statement["logic"])
    filters = statement["filters"]

    if not filters:
        return (lambda _: True)

    def validator(obj: object) -> bool:
        res = True

        for f in filters:
            op        = LogicalOp.from_other(f["operator"])
            obj_value = getattr(obj, f["field"])
            fil_value = f["value"]
            print(op, obj_value, fil_value)
            res  = logic.do(res, op.do(fil_value, obj_value))

        return res

    return validator

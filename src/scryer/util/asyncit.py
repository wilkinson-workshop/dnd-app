import typing

__all__ = ("_aiter",)


class _aiter[T]:
    """Barebones asyncronous iteratator."""

    def __init__(self, obj: typing.Iterable[T]):
        self.obj_iter = iter(obj)

    def __aiter__(self):
        return self

    async def __anext__(self) -> T:
        return next(self.obj_iter)

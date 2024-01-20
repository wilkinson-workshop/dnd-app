import abc, typing

from scryer.services.service import Service, ServiceStatus
from scryer.util import shelves

type LocatedPair[K, R] = tuple[K, R]
type Located[K, R] = typing.Sequence[LocatedPair[K, R]]


class Broker[K, R](Service):
    """
    Manages, or maintains, some resource.
    Typically used for brokering in-memory
    objects.
    """

    @abc.abstractmethod
    def create(self) -> tuple[K, R]:
        """Create a new resource instance."""
    @abc.abstractmethod
    def delete(self, key: R) -> None:
        """
        Delete a resource related to the key.
        """
    @abc.abstractmethod
    def locate(self, *keys: K) -> typing.Sequence[tuple[K, R]]:
        """
        Attempt to find resources that are related
        to the given keys.
        """
    # This is just syntactic sugar here, but it
    # helps us identify what inputs our method
    # should be allowed to accept. The method at
    # the bottom of this definition stack is what
    # will be enforced as what needs to be
    # implementend by lower objects.
    @typing.overload
    @abc.abstractmethod
    def modify(self, key: R, **kwds) -> None:
        pass
    @typing.overload
    @abc.abstractmethod
    def modify(self, key: R, resource: R) -> None:
        pass
    @abc.abstractmethod
    def modify(self, key: R, *args, **kwds) -> None:
        """
        Push changes to an existing resource.
        """


class ShelfBroker[R](Broker[str, R]):
    """
    A partial implementation of a broker which
    utilizes the `shelve` module to store
    resources persistently.
    """

    resource_cls: type[R]
    shelf:        shelves.Shelf

    def __init__(self, shelf_name: str, cls: type[R]) -> None:
        self.resource_cls = cls
        self.shelf_name   = shelf_name

    # `__enter__` and `__exit__` are special
    # methods in Python. They allow us to override
    # or extend built-in behaviors, and in this
    # case, allows us to use this class as a
    # context manager. This is where you'll see
    # the `with self` statements. Think of
    # `__enter__` as the setup and `__exit__` as
    # the teardown.
    def __enter__(self):
        self.shelf = shelves.open(self.shelf_name)
        return self

    def __exit__(self, *_):
        self.shelf.close() #type: ignore

    @property
    def status(self) -> ServiceStatus:
        return ServiceStatus.ONLINE

    async def delete(self, key: str):
        with self as opened:
            opened.shelf.pop(key, None)

    async def locate(self, *keys: str) -> typing.Sequence[tuple[str, R]]:
        with self as opened:
            if len(keys) == 0: return shelf_locate_all(opened)
            if len(keys) == 1:
                locate_inator = shelf_locate_one
            else:
                locate_inator = shelf_locate_any
            return locate_inator(opened, *keys)


def shelf_locate_all[R](sb: ShelfBroker) -> Located[str, R]:
    """
    Returns all resource entries in the shelf.
    """

    return shelf_locate_any(sb, *sb.shelf.keys())


def shelf_locate_any[R](sb: ShelfBroker, *keys: str) -> Located[str, R]:
    """
    Return all resources that match the given
    key(s).
    """

    pred = lambda lp: lp[1] is not None
    return tuple(filter(pred, ((k, shelf_locate_one(sb, k)) for k in keys)))        


def shelf_locate_one[R](sb: ShelfBroker, key: str) -> LocatedPair[str, R]:
    """
    Attempt to locate a resource entry at the
    specified key.
    """

    return sb.shelf.get(key, None)

import abc, typing

from scryer import shelves
from scryer.services.service import Service, ServiceStatus


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
    def locate(self, *keys: R) -> typing.Sequence[tuple[K, R]]:
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

    async def delete(self, key: str):
        with self as opened:
            opened.shelf.pop(key, None)

    async def locate(self, key: str) -> typing.Sequence[R]:
        with self as opened:
            return opened.shelf.get(key, None)

    async def status(self) -> ServiceStatus:
        return ServiceStatus.ONLINE

import abc, math, typing

import redis

from scryer.services.service import Service, ServiceStatus
from scryer.util import shelves
from scryer.util.filters import FilterStatement, FilterValidator, compose_validator

type LocatedPair[K, R] = tuple[K, R]
type Located[K, R] = typing.Sequence[LocatedPair[K, R]]
type Locator[K: typing.Hashable, R] = typing.Callable[[K], R | None]


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
    def locate(
            self,
            *keys: K,
            statement: FilterStatement | None) -> Located[K, R]:
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
    def modify(self, key: K, **kwds) -> None:
        pass
    @typing.overload
    @abc.abstractmethod
    def modify(self, key: K, resource: R) -> None:
        pass
    @abc.abstractmethod
    def modify(self, key: K, *args, **kwds) -> None:
        """
        Push changes to an existing resource.
        """


class MemoryBroker[K: typing.Hashable, R](Broker[K, R]):
    """
    Some key/value storage that occurs in-memory.
    """

    resource_cls:          type[R]
    resource_map:          typing.MutableMapping[K, R]
    resource_map_capacity: typing.SupportsInt | typing.SupportsFloat

    def __init__(self,  cls: type[R], max_size: int | None = None):
        self.resource_map_capacity = max_size or math.inf
        self.resource_map = dict()
        self.resource_cls = cls

    def __iter__(self):
        return iter(self.resource_map.values())

    @property
    def _capacity_delta(self):
        return self.resource_map_capacity - len(self.resource_map)

    @property
    def status(self):
        if self._capacity_delta > 0:
            return ServiceStatus.ONLINE
        else:
            return ServiceStatus.BUSY
        
    async def delete(self, key: K):
        self.resource_map.pop(key)

    async def locate(
            self,
            *keys: K,
            statement: FilterStatement | None = None) -> Located[K, R]:

        locator = lambda key: self.resource_map.get(key, None)
        return _locate_any(locator, keys or self.resource_map.keys(), statement)


class RedisBroker[K, R](Broker[K, R]):
    """
    A partial implementation of a broker which
    interacts with a `Redis` server.
    """

    resource_cls: type[R]
    redis_client: redis.Redis

    def __init__(self, cls: type[R], url: str, **kwds):
        """
        Initialize a `RedisBroker` instance from
        a `URL` connection string. By default,
        this implementation decodes responses from
        the server into Python native strings
        instead of bytes.
        """

        self.redis_client = cls
        self.redis_client = redis.Redis.from_url(
            url,
            decode_responses=True,
            **kwds)

    @property
    def status(self):
        available = self.redis_client.ping() == "PONG"
        return ServiceStatus.ONLINE if available else ServiceStatus.UNAVAILABLE

    async def delete(self, key: str):
        self.redis_client.delete(key)

    async def locate(
        self,
        *keys: K,
        statement: FilterStatement | None = None) -> Located[str, R]:

        locator = lambda key: self.redis_client.get(key)
        keys    = self.redis_client.keys("|".join(keys) if keys else "*")
        return _locate_any(locator, keys, statement)


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
    def status(self):
        return ServiceStatus.ONLINE

    async def delete(self, key: str):
        with self as opened:
            opened.shelf.pop(key, None)

    async def locate(
        self,
        *keys: str,
        statement: FilterStatement | None = None) -> Located[str, R]:

        locator = lambda key: self.resource_map.get(str(key), None)
        with self as _:
            return _locate_any(locator, keys or self.shelf.keys(), statement)


def _locate_any[K: typing.Hashable, R](
        locator: Locator[K, R],
        keys: typing.Sequence[K],
        statement: FilterStatement | None) -> Located[K, R]:
    """
    Return all resources that match the given
    key(s).
    """

    isvalid = compose_validator(statement) if statement else (lambda _: True)
    pred    = lambda found: found[1] is not None and isvalid(found[1])
    return tuple(filter(pred, ((k, locator(k)) for k in keys)))

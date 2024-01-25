import asyncio
import time

from scryer.creatures import Creature
from scryer.services.brokers import MemoryBroker
from scryer.util import UUID


class CreaturesMemoryBroker(MemoryBroker[UUID, Creature]):
    """
    Implementation of `MemoryBroker` which stores
    objects implementing the `Creature` protocol.

    This allows for creatures to be stored
    in-memory when persistence is not a priority.
    """

    async def create(
            self,
            *args,
            timeout: float | None = None,
            **kwds) -> tuple[UUID, Creature]:

        start = time.monotonic()
        while timeout is not None:
            if self._capacity_delta > 0:
                break
            if time.monotonic() - start >= timeout:
                raise TimeoutError("waited too long for memory to free.")
            await asyncio.sleep(0.25)

        creature = self.resource_cls(*args, **kwds)
        self.resource_map[creature.creature_uuid] = creature
        return (creature.creature_uuid, creature)

    async def modify(self, key: UUID, resource: Creature, *args, **kwds):
        self.resource_map[key] = resource

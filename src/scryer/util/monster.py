import abc, asyncio, functools, json, typing, uuid

from pydantic import BaseModel, ConfigDict
from scryer.creatures.attrs import Role


from scryer.creatures import CharacterV2, Creature, CreatureV2, Role
from scryer.services import (
    Broker,
    EventBroker,
    MemoryBroker,
    RedisBroker,
    ShelfBroker
)

from scryer.services.creatures import CreaturesMemoryBroker

from scryer.util import UUID, request_uuid

__all__ = (
    "CustomMonster",
    "CustomMonsterMemoryBroker"
)


class BaseMonster(BaseModel):
    """
    The base model for custom monsters
    """

class CustomMonster(BaseMonster):
    """
    A custom monster is used to store custom creature stats
    used when adding it to a session and showing full stats
    """    

    _monster:    dict

    @classmethod
    def new_instance(
            cls,
            dict: dict) -> typing.Self:

        inst = cls()
        inst._monster = dict

        return inst
    
    @property
    def monster(self) -> dict:
        return self._monster
    

class CustomMonsterMemoryBroker(MemoryBroker[str, CustomMonster]):
    """
    Implementation of `MemoryBroker` for storing
    and maintaining `Custom Monster` objects.
    """

    _next_index: int = 0

    @typing.override
    async def create(
            self,
            dict: dict):

        index = f"custom{self._next_index}"
        dict['index'] = index
        if(dict['name'] == 'Custom'):
            dict['name'] = f"Custom{self._next_index}"
        monster = self.resource_cls.new_instance(
            dict)
        
        self.resource_map[index] = monster

        self._next_index += 1
        return (index, dict)
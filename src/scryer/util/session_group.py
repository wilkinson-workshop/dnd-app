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
    "SessionGroup",
    "sessionGroupApi"
    "SessionGroupMemoryBroker"
)

class SessionGroupApi(BaseModel):
    group_uuid: UUID
    group_name: str


class BaseGroup(BaseModel):
    """
    The base model for session groups
    """

class SessionGroup(BaseGroup):
    """
    A session group used to store creatures in advance 
    for swapping in to the initiative order quickly
    """    

    _group_uuid:    UUID
    _group_name:    str | None
    _characters:    Broker[UUID, Creature]

    @classmethod
    def new_instance(
            cls,
            name: str) -> typing.Self:

        inst = cls()
        inst._group_uuid = request_uuid()
        inst._group_name = name

        inst._characters   = CreaturesMemoryBroker(CharacterV2)
        return inst
    
    @property
    def characters(self) -> Broker[UUID, Creature]:
        return self._characters
    
    @property 
    def group_name(self) -> str: 
        default_name = f"{type(self).__name__}:{self.group_uuid!s}" 
        return self._group_name or default_name

    @property
    def group_uuid(self) -> UUID:
        return self._group_uuid
    

class SessionGroupMemoryBroker(MemoryBroker[UUID, SessionGroup]):
    """
    Implementation of `MemoryBroker` for storing
    and maintaining `Session Group` objects.
    """

    @typing.override
    async def create(
            self,
            name: str):

        group = self.resource_cls.new_instance(
            name)
        
        group_uuid = group.group_uuid
        self.resource_map[group_uuid] = group
        return (group_uuid, group)
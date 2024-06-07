import typing

from scryer.services.brokers import Broker, DatabaseBroker
from scryer.util import request_uuid, UUID
from scryer.data import (
    DAO,
    CombatCreature,
    CombatGroup,
    CombatSession
)


class CombatCreatureDatabaseBroker(DatabaseBroker[UUID, CombatCreature]):
    pass


class CombatGroupDatabaseBroker(DatabaseBroker[UUID, CombatGroup]):
    pass


class CombatSessionDatabaseBroker(DatabaseBroker[UUID, CombatSession]):
    pass

"""
Database layer and models responsible for
managing `scryer` objects and their states in an
ORM.
"""

__all__ = (
    "CombatCreature",
    "CombatGroup",
    "CombatSession",
    "DAO",
    "SQLiteDAO"
)

from scryer.data.dao import DAO, SQLiteDAO
from scryer.data.models import Base, CombatCreature, CombatGroup, CombatSession


if __name__ == "__main__":
    from scryer.util import request_uuid

    with SQLiteDAO() as dao:
        cs = CombatSession(
            uuid=request_uuid(),
            description="A test session",
            name="Test Session"
        )

        dao.init_tables()
        dao.session.add(cs)
        dao.session.commit()

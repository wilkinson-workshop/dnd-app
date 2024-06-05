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
from scryer.data.models import CombatCreature, CombatGroup, CombatSession


if __name__ == "__main__":
    with SQLiteDAO() as dao:
        pass

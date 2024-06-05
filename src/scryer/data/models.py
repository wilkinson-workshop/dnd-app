from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Uuid, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from scryer.util import UUID


class Base(DeclarativeBase):
    """
    Base class for subsequent `scryer` models.
    """


class CombatSession(Base):
    """
    Represents the state of a combat session.
    """

    __tablename__ = "combat_sessions"

    uuid:              Mapped[UUID]        = mapped_column(Uuid(), primary_key=True)
    current_character: Mapped[UUID | None] = mapped_column(Uuid())
    description:       Mapped[str]         = mapped_column(String(256))
    name:              Mapped[str]         = mapped_column(String(128))
    created_at:        Mapped[datetime]    = mapped_column(DateTime(), server_default=func.now())
    updated_at:        Mapped[datetime]    = mapped_column(DateTime(), server_default=func.now(), onupdate=func.now())

    creatures: Mapped[list["CombatCreature"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan"
    )
    groups: Mapped[list["CombatGroup"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan"
    )


class CombatGroup(Base):
    """
    Represents the custom groups defined by a
    Dungeon Master for a specific `CombatSession`
    """

    __tablename__ = "combat_groups"

    uuid:         Mapped[UUID] = mapped_column(Uuid(), primary_key=True)
    name:         Mapped[str]  = mapped_column(String(128))
    session_uuid: Mapped[UUID] = mapped_column(Uuid(), ForeignKey("combat_sessions.uuid"))
    created_at:   Mapped[datetime]    = mapped_column(DateTime(), server_default=func.now())
    updated_at:   Mapped[datetime]    = mapped_column(DateTime(), server_default=func.now(), onupdate=func.now())

    creatures: Mapped[list["CombatCreature"]] = relationship(
        back_populates="group",
        cascade="all, delete-orphan"
    )
    session: Mapped["CombatSession"] = relationship(back_populates="groups")


class CombatCreature(Base):
    """
    Represents the creatures, either in the field
    or stashed away in a grouping, related to a
    particular `CombatSession`.
    """

    __tablename__ = "combat_creatures"

    uuid:              Mapped[UUID]        = mapped_column(Uuid(), primary_key=True)
    conditions:        Mapped[str]         = mapped_column(String(256))
    hitpoints_max:     Mapped[int]         = mapped_column()
    hitpoints_current: Mapped[int]         = mapped_column()
    name:              Mapped[str]         = mapped_column(String(128))
    role:              Mapped[str]         = mapped_column(String(16))
    monster:           Mapped[str | None]  = mapped_column(String(128), nullable=True)
    session_uuid:      Mapped[UUID | None] = mapped_column(Uuid(), ForeignKey("combat_sessions.uuid"), nullable=True)
    group_uuid:        Mapped[UUID | None] = mapped_column(Uuid(), ForeignKey("combat_groups.uuid"), nullable=True)
    created_at:        Mapped[datetime]    = mapped_column(DateTime(), server_default=func.now())
    updated_at:        Mapped[datetime]    = mapped_column(DateTime(), server_default=func.now(), onupdate=func.now())

    session: Mapped["CombatSession"] = relationship(back_populates="creatures")
    group:   Mapped["CombatGroup"]   = relationship(back_populates="creatures")

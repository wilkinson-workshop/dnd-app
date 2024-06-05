import abc
import os
import pathlib
import typing

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session

from scryer.data.models import Base


class DAO(typing.Protocol):
    """
    **Database Access Object**. An abstraction
    layer between `scryer` and the peristence
    layer
    """

    @property
    @abc.abstractmethod
    def engine(self) -> Engine:
        """Returns the internal DAO engine."""

    @property
    @abc.abstractmethod
    def session(self) -> Session:
        """Returns the internal DAO session."""

    @abc.abstractmethod
    def init_tables(self) -> None:
        """Initialize all database tables."""

    @abc.abstractmethod
    def __enter__(self) -> Session:
        pass

    @abc.abstractmethod
    def __exit__(self, *args) -> None:
        pass


class DAOBase(DAO):
    """
    This is the base `DAO` implementation. While
    it can be used directly, it is not
    recommended.
    """

    _engine:      Engine
    _ctx_session: Session | None

    @property
    def engine(self) -> Engine:
        return self._engine

    @property
    def session(self) -> Session:
        if self._ctx_session:
            return self._ctx_session
        raise AttributeError("DAO session was not initialized")

    def init_tables(self) -> None:
        Base.metadata.create_all(self.engine)

    def __init__(self, conn_str: str):
        """Initialize a new `DAO` instance."""
        self._ctx_session = None
        self._engine      = create_engine(conn_str, echo=True)

    def __enter__(self) -> typing.Self:
        self._ctx_session = Session(self.engine).__enter__()
        return self

    def __exit__(self, *args):
        if self._ctx_session:
            self._ctx_session.__exit__(*args)
            self._ctx_session = None


class SQLiteDAO(DAOBase):
    """
    `SQLite` implementation of a `DAO`. Allows a
    user to connect to some SQLite database.
    Either to a specific instance or simply run
    in-memory.
    """

    type Path = pathlib.Path | os.PathLike[str] | str

    def __init__(self, file: Path | None = None):
        """
        Initialize and connect to a `SQLite`
        database file.
        """

        # We can optionally not pass a file path
        # and then instead run SQLite in-memory.
        conn_str = "sqlite://"
        if file:
            file = file if isinstance(file, pathlib.Path) else pathlib.Path(file)
            if os.name == "unix":
                conn_str += f"//{file!s}"
            else:
                conn_str += f"/{file!s}"
        super().__init__(conn_str)

import abc
import typing

import typing
if typing.TYPE_CHECKING:
    from scryer.services import Session
else:
    # A dummy type to represent the actual session
    # object.
    type Session[T] = object


@typing.runtime_checkable
class User(typing.Protocol):
    @property
    @abc.abstractmethod
    def is_active(self) -> bool:
        """
        User is currently online and in a
        session.
        """

    @property
    @abc.abstractmethod
    def session(self) -> Session[typing.Any]:
        """`Session` user is connected to."""

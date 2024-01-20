import abc
import typing

# A dummy type to represent the actual session
# object.
type Session[T] = object


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

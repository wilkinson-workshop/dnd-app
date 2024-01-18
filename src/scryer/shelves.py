"""
Special wrapper around the Python `shelve` module.
In case it is not available, defines a dummy
implementation that acts as a surrogate.
"""

import typing

try:
    # This module is potentially not implemented
    # depending on the platform and the packages
    # available to said system.
    from shelve import open, Shelf #type: ignore
    SHELVE_IMPLEMENTED = True
except ImportError:
    # Python can't find shelve, therefore define
    # our own-- simple-- implementation.
    SHELVE_IMPLEMENTED = False


    class Shelf[T](dict[str, T]):
        def close(self) -> None:
            pass


    def open(
            filename: str,
            flag: str = "c",
            protocol: int | None = None,
            writeback: bool = False) -> Shelf[typing.Any]:

        return Shelf()


__all__ = ("open", "Shelf")

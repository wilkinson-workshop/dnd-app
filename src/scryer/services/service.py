import abc, enum, typing


class ServiceStatus(enum.StrEnum):
    """
    The status type of an individual service.
    """

    ACTIVE  = "active"
    """Service is online and currently running."""

    BUSY = "busy"
    """
    Service is online, but cannot be reached due
    to being preoccupied.
    """

    OFFLINE = "offline"
    """
    Either the service, its host, or both are
    unavailable.
    """

    ONLINE = "online"
    """The service is online and available."""

    UNAVAILABLE = "unavailable"
    """
    The service host can be pinged, but the
    service itself cannot be reached.
    """


class Service(typing.Protocol):
    """
    An external data source, task or subprocess
    """

    @property
    @abc.abstractmethod
    def status(self) -> ServiceStatus:
        """The current status of the service."""

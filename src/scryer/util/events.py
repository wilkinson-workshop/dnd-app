import enum, typing

from pydantic import BaseModel, ConfigDict

from scryer.util import UUID

__all__ = (
    "Event",
    "ClientUUID",
    "Message",
    "ReceiveClientUUID",
    "ReceiveOrderUpdate",
    "ReceiveRoll",
    "ReceiveSecret",
    "RequestRoll"
)

type PartialEvent[B, **P] = typing.Callable[typing.Concatenate[B, P], Event]
"""
Callable object that is a constructor for an event
with preset values.
"""


class BaseEvent(BaseModel):
    """
    The base model for event type bodies used
    between our appliction and connecting clients.
    """


class EventBody(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class EventType(enum.StrEnum):
    """
    The types of events our system uses.
    """

    MESSAGE              = enum.auto()
    RECEIVE_CLIENT_UUID  = enum.auto()
    RECEIVE_ORDER_UPDATE = enum.auto()
    RECEIVE_ROLL         = enum.auto()
    RECEIVE_SECRET       = enum.auto()
    REQUEST_ROLL         = enum.auto()


class Event(BaseEvent):
    """
    An event sent or received by this application.
    """

    session_uuid: UUID | None = None
    event_body:   EventBody | None = None
    event_type:   EventType | None = None

    @property
    def send_to(self) -> typing.Sequence[UUID]:
        """
        The intended recipients for this event.
        """

        clients = getattr(self.event_body, "client_uuids", None)
        return clients or ()


class PlayerInput(EventBody):
    """
    This is the request and response class for
    sending dice roles from player to dm.
    """

    value: int
    name:  str


class ClientUUID(EventBody):
    client_uuid: str


class RequestPlayerInput(EventBody):
    """
    This is the reqeust of the player(s) to submit
    a dice role for use by the dm. 
    Recipient value could be All for all players
    or a specific client id to send the
    notification to ony one.   
    """

    dice_type:    int
    client_uuids: list[UUID]
    reason:       str

class PlayerInput(EventBody):
    """
    This is the request and response class for
    sending dice roles from player to dm.
    """

    value: int
    body:  RequestPlayerInput


class PlayerSecret(EventBody):
    """
    This is the request for sending secrets from
    DM to player
    """

    secret:       str
    client_uuids: list[UUID]


def NewEvent(
        etype: EventType,
        ebody: EventBody,
        *,
        session_uuid: UUID | None = None) -> Event:
    """Create a new event wrapper."""

    return Event(event_type=etype, event_body=ebody)


def Message(body: EventBody, **kwds):
    return NewEvent(EventType.MESSAGE, body, **kwds)


def ReceiveClientUUID(body: EventBody, **kwds):
    return NewEvent(EventType.RECEIVE_CLIENT_UUID, body, **kwds)


def ReceiveOrderUpdate(body: EventBody, **kwds):
    return NewEvent(EventType.RECEIVE_ORDER_UPDATE, body, **kwds)


def ReceiveRoll(body: EventBody, **kwds):
    return NewEvent(EventType.RECEIVE_ROLL, body, **kwds)


def ReceiveSecret(body: EventBody, **kwds):
    return NewEvent(EventType.RECEIVE_SECRET, body, **kwds)


def RequestRoll(body: EventBody, **kwds):
    return NewEvent(EventType.REQUEST_ROLL, body, **kwds)

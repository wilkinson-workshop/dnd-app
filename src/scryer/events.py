import enum, typing, uuid

from pydantic import BaseModel

from scryer.creatures import Role
from scryer.util import UUID, request_uuid

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
    pass


class EventType(enum.StrEnum):
    """
    The types of events our system uses.
    """

    RECEIVE_ORDER_UPDATE = enum.auto()
    RECEIVE_ROLL         = enum.auto()
    RECEIVE_SECRET       = enum.auto()
    REQUEST_ROLL         = enum.auto()


class Event(BaseEvent):
    """
    An event sent or received by this application.
    """

    event_body: EventBody | None = None
    event_type: EventType | None = None


class PlayerInput(EventBody):
    """
    This is the request and response class for
    sending dice roles from player to dm.
    """

    value: int
    name:  str


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


class PlayerSecret(EventBody):
    """
    This is the request for sending secrets from
    DM to player
    """

    secret:       str
    client_uuids: list[UUID]


def NewEvent(etype: EventType, ebody: EventBody):
    """Create a new event wrapper."""

    return Event(event_type=etype, event_body=ebody)


def ReceiveOrderUpdate(body: EventBody):
    return NewEvent(EventType.RECEIVE_ORDER_UPDATE, body)


def ReceiveRoll(body: EventBody):
    return NewEvent(EventType.RECEIVE_ROLL, body)


def ReceiveSecret(body: EventBody):
    return NewEvent(EventType.RECEIVE_SECRET, body)


def RequestRoll(body: EventBody):
    return NewEvent(EventType.REQUEST_ROLL, body)

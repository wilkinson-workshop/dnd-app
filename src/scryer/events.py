import enum, typing, uuid

from pydantic import BaseModel

from scryer.creatures import Role
from scryer.util import UUID

type Entity = tuple[Role, UUID]
"""
A pair of items that represent an entity which has
a role and an identity.
"""
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


class EventType(enum.StrEnum):
    """
    The types of events our system uses.
    """

    RECEIVE_ORDER_UPDATE = enum.auto()
    RECEIVE_ROLL         = enum.auto()
    RECEIVE_SECRET       = enum.auto()
    REQUEST_ROLL         = enum.auto()


class Event[B](BaseEvent):
    """
    An event sent or received by this application.
    """

    event_body: B | None         = None
    event_type: EventType | None = None
    accepting:  Entity | None    = None
    sending:    Entity           = (Role.ADMINISTRATOR, uuid.uuid1())


def ReceiveOrderUpdate[B](**kwds):
    return Event[B](event_type=EventType.RECEIVE_ORDER_UPDATE, **kwds)


def ReceiveRoll[B](**kwds):
    return Event[B](event_type=EventType.RECEIVE_ROLL, **kwds)


def ReceiveSecret[B](**kwds):
    return Event[B](event_type=EventType.RECEIVE_SECRET, **kwds)


def RequestRoll[B](**kwds):
    return Event[B](event_type=EventType.REQUEST_ROLL, **kwds)

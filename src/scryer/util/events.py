import enum, typing

from pydantic import BaseModel, ConfigDict
from scryer.creatures.attrs import Role

from scryer.util import UUID

__all__ = (
    "Event",
    "ClientUUID",
    "Message",
    "JoinSession",
    "ReceiveClientUUID",
    "ReceiveOrderUpdate",
    "ReceiveRoll",
    "ReceiveMessage",
    "RequestRoll",
    "SessionJoinBody",
    "dump_event"
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

class SessionJoinBody(typing.TypedDict):
    session_uuid: str
    role: Role
    name: str
    client_uuid: str


class EventType(enum.StrEnum):
    """
    The types of events our system uses.
    """

    MESSAGE               = enum.auto()
    RECEIVE_CLIENT_UUID   = enum.auto()
    RECEIVE_ORDER_UPDATE  = enum.auto()
    RECEIVE_ROLL          = enum.auto()
    RECEIVE_MESSAGE       = enum.auto()
    REQUEST_ROLL          = enum.auto()

    JOIN_SESSION          = enum.auto()
    END_SESSION           = enum.auto()



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


class ClientUUID(EventBody):
    client_uuid: str


class RequestPlayerInput(EventBody):
    """
    This is the request of the player(s) to submit
    a dice role for use by the dm. 
    Recipient value could be All for all players
    or a specific client id to send the
    notification to ony one.   
    """

    dice_type:    int
    client_uuids: list[UUID]
    reason:       str

class NewCurrentOrder(EventBody):
    creature_uuid: str | None


class PlayerInput(EventBody):
    """
    This is the request and response class for
    sending dice roles from player to dm.
    """

    value: int
    reason: str
    name: str
    client_uuid: str


class PlayerMessage(EventBody):
    """
    This is the request for sending chat messages
    between users
    """

    sender:       str
    message:      str
    client_uuids: list[UUID]


def dump_event(event: Event) -> dict[str, object]:
    """
    Transform an event into a dictionary
    representation of itself.
    """

    dump = event.model_dump()
    if "event_body" in dump and not dump["event_body"]:
        # Event body was empty. Most likely due to
        # an issue with model inheritence.
        event_body = event.event_body.model_dump() #type: ignore
        if isinstance(event_body, dict) and "client_uuids" in event_body:
            event_body["client_uuids"] = [
                str(u) for u in event_body["client_uuids"]
            ]
        dump["event_body"] = event_body
    return dump


def NewEvent(
        etype: EventType,
        ebody: EventBody,
        *,
        session_uuid: UUID | None = None) -> Event:
    """Create a new event wrapper."""

    return Event(event_type=etype, event_body=ebody, session_uuid=session_uuid)


def Message(body: EventBody, **kwds):
    return NewEvent(EventType.MESSAGE, body, **kwds)

def JoinSession(body: EventBody, **kwds):
    return NewEvent(EventType.JOIN_SESSION, body, **kwds)

def ReceiveClientUUID(body: EventBody, **kwds):
    return NewEvent(EventType.RECEIVE_CLIENT_UUID, body, **kwds)


def ReceiveOrderUpdate(body: EventBody, **kwds):
    return NewEvent(EventType.RECEIVE_ORDER_UPDATE, body, **kwds)


def ReceiveRoll(body: EventBody, **kwds):
    return NewEvent(EventType.RECEIVE_ROLL, body, **kwds)


def ReceiveMessage(body: EventBody, **kwds):
    return NewEvent(EventType.RECEIVE_MESSAGE, body, **kwds)


def RequestRoll(body: EventBody, **kwds):
    return NewEvent(EventType.REQUEST_ROLL, body, **kwds)

def EndSession(body: EventBody, **kwds):
    return NewEvent(EventType.END_SESSION, body, **kwds)

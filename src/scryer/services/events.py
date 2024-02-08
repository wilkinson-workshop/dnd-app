import abc, asyncio, typing

from scryer.services.brokers import Broker, MemoryBroker
from scryer.util import request_uuid, UUID
from scryer.util.events import Event, EventBody, Message, PartialEvent


class EventBroker(Broker[UUID, Event]):

    @typing.override
    @abc.abstractmethod
    async def create[B, **P](
            self,
            session_uuid: UUID,
            body: EventBody,
            factory: PartialEvent[B, P] | None = None,
            *_: P.args,
            **kwds: P.kwargs) -> tuple[UUID, Event]:
        """
        Override of the `create` method to create
        a new event and associated it with the
        given session `UUID`.
        """


class EventMemoryBroker(EventBroker, MemoryBroker[UUID, Event]):
    """
    Implementation of memory broker which manages
    events at runtime.
    """

    async def create[B, **P](
            self,
            session_uuid: UUID,
            body: EventBody,
            factory: PartialEvent[B, P] | None = None,
            *_: P.args,
            **kwds: P.kwargs) -> tuple[UUID, Event]:

        event_uuid = request_uuid()
        event = (factory or Message)(body, session_uuid=session_uuid **kwds) #type: ignore
        self.resource_map[event_uuid] = event
        return (event_uuid, event)

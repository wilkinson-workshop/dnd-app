import abc, typing

from fastapi import WebSocket

from scryer.creatures import HitPoints, Role
from scryer.services.brokers import Broker, MemoryBroker
from scryer.services.service import ServiceStatus
from scryer.util import UUID, request_uuid


class SessionCookies(typing.TypedDict):
    """
    Cookies passable between server and client
    via socket connection.
    """

    client_uuid:  UUID # Client UUID is the same as Creature UUID.
    name:         str
    role:         Role
    session_uuid: UUID

class SessionSocket(WebSocket):
    """
    Purely representative type. Used to override
    properties of `WebSocket` to more clearly
    define what we should expecte from the object.
    """

    cookies:      SessionCookies

class SocketBroker(Broker[UUID, SessionSocket]):

    @typing.override
    @abc.abstractmethod
    async def create(self, sock: SessionSocket) -> tuple[UUID, SessionSocket]:
        """
        Override of the `create` method to instead
        accept a socket connection then prepare
        the connection based on our needs.
        """


class SocketMemoryBroker(SocketBroker, MemoryBroker[UUID, SessionSocket]):
    """
    Implementation of a memory broker which
    manages socket connections between server and
    client.
    """
    
    async def create(self, sock: SessionSocket):
        client_uuid = sock.cookies["client_uuid"]

        if not (await self.wait_ready(timeout=15.0)):
            await sock.send_text("maximum connections exceeded")
            await sock.close()
            return (client_uuid, sock)

        self.resource_map[client_uuid] = sock

        return (client_uuid, sock)

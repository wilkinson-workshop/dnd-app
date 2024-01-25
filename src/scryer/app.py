"""
The HTTP server core implementation.
"""

import enum
import pathlib

# Third-party dependencies.
from fastapi import (
    APIRouter, 
    FastAPI, 
    HTTPException, 
    WebSocket, 
    WebSocketDisconnect,
    WebSocketException
)
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Project level modules go here.
from scryer.creatures import CharacterV2, HitPoints, Role
from scryer.services import ServiceStatus
from scryer.services.sessions import CombatSession, SessionMemoryBroker
from scryer.util import request_uuid, UUID


class EventType(enum.StrEnum):
    """
    The types of events the system uses.
    """
    DM_RECEIVE_ROLL             = enum.auto()
    PLAYER_RECEIVE_SECRET       = enum.auto()
    PLAYER_REQUEST_ROLL         = enum.auto()
    PLAYER_RECEIVE_ORDER_UPDATE = enum.auto()


class EventMessage(BaseModel):
    event_type: EventType
    event_body: str


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {"players": [], "dm": []}

    async def connect(self, websocket: WebSocket, is_player: bool):
        await websocket.accept()
        if(is_player):
            self.active_connections["players"].append(websocket)
        else:
            self.active_connections["dm"].append(websocket)

    def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections["players"].remove(websocket)
        except:
            self.active_connections["dm"].remove(websocket)

    async def send_player_session_event(self, session_id: str, message: EventMessage):        
        for connection in self.active_connections["players"]:
            await connection.send_text(message.event_type)

    async def send_dm_session_event(self, session_id: str, message: EventMessage):
        for connection in self.active_connections["dm"]:
            await connection.send_text(message.event_type)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()

# Root directory appliction is being executed
# from. Will be used for creating and
# fetching assets related to the application.
EXECUTION_ROOT   = pathlib.Path.cwd()
APPLICATION_ROOT = pathlib.Path(__file__).parent
SOURCE_ROOT      = APPLICATION_ROOT.parent


class JoinSessionRequest(BaseModel):
    client_uuid: str
    name:        str
    role:        Role


# this is the reqeust and response class for
# sending dice roles from player to dm.
class PlayerInput(BaseModel):
    input:      int
    name:       str
    clientId:   str


# This is the reqeust of the player(s) to submit a
# dice role for use by the dm. 
# Recipient value could be All for all players or
# a specific client id to send the notification to
# ony one.    
class RequestPlayerInput(BaseModel):
    diceType:   int
    recipient:  str
    reason:     str


# this is the reqeust for sending secrets from dm
# to player
class PlayerSecret(BaseModel):
    secret:     str
    clientId:   str



# Ideally only one value should be for each client
# using client id in playerInput
class PlayerInputService():
    __inputs:list[PlayerInput]= []

    @classmethod
    def getAll(cls):
        return cls.__inputs

    @classmethod
    def add(cls, input):
        cls.__inputs.append(input)
    
    @classmethod
    def clear(cls):
        cls.__inputs = []


async def _character_make(session_uuid: str, character: CharacterV2):
    session: CombatSession
    _, session = (await _sessions_find(session_uuid))[0]
    await session.characters.modify(character.creature_uuid, character)


async def _sessions_find(session_uuid: str | None = None):
    locator = APP_SERIVCES["sessions"].locate
    locator = locator(request_uuid(session_uuid)) if session_uuid else locator()

    found = await locator
    if not found and session_uuid:
        raise HTTPException(404, f"No session at {session_uuid}")
    return found


# -----------------------------------------------
# Appliction Services.
# -----------------------------------------------
APP_SERIVCES = {
    "sessions": SessionMemoryBroker(CombatSession),
}

# -----------------------------------------------
# Web/HTTP Application Defintion.
# -----------------------------------------------
# Initialize the application config in static
# space.
app = FastAPI()


def check_application():
    """
    Performs a healthcheck against all
    services and returns those results.
    """

    return [check_application_service(name) for name in APP_SERIVCES]


def check_application_service(name: str):
    return {"name": name, "status": APP_SERIVCES[name].status}


def setup_application():
    """
    A factory function responsible for finalizing
    the appliction on each reload.
    """

    # Load middlewares
    for cls, args, kwds in APP_MIDDLEWARES:
        app.add_middleware(cls, *args, **kwds) #type: ignore
    # Install external application mounts.
    for mount in ASGI_APP_MOUNTS:
        app.mount(*mount)
    # Intall routes from appliction routers.
    for _, router in APP_ROUTERS.items():
        app.include_router(router)

    return app


# -----------------------------------------------
# API Middlewares.
# -----------------------------------------------
# Predefine middleware layers our application will
# use on each transaction between server and
# client.
# `AppMiddleware` represents how config entries of
# `APP_MIDDLEWARES` will be defined; where `type`
# is the middleware class, the `tuple` and `dict`
# types are the positional and key-word arguments
# passed to the middleware constuctor.
type AppMiddleware = tuple[type, tuple, dict]

APP_MIDDLEWARES: tuple[AppMiddleware, ...] = (
    (
        # Middleware needed for CORS since the UI
        # is on a different port.
        CORSMiddleware,
        tuple(),
        dict(
            allow_origins=("http://localhost", "http://localhost:3000"),
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"]
        )
    ),
)

# -----------------------------------------------
# API Routes.
# -----------------------------------------------
APP_ROUTERS = {
    # Defines the routes available to the server
    # admin.
    "admin": APIRouter(prefix="/admin"),
    # Define character/creature manipulation
    # endpoints.
    "character": APIRouter(prefix="/characters"),
    # Defines the routes available for clients
    "client": APIRouter(prefix="/clients"),
    # Defines the routes available to managing
    # game sessions.
    "session": APIRouter(prefix="/sessions")
}

# -----------------------------------------------
# External ASGI applications.
# -----------------------------------------------
# The defined applications are to be mounted by
# the root application later. Will be used for
# serving additional materials to the front-end.
ASGI_APP_MOUNTS = (
    ("/static", StaticFiles(directory=SOURCE_ROOT / "static", html=True)),
)


@APP_ROUTERS["character"].get("/")
@APP_ROUTERS["character"].get("/{session_uuid}")
async def characters_find(session_uuid: str | None = None):
    """List current characters on the field."""

    found = await _sessions_find(session_uuid)
    data  = {
        f[1].session_uuid: [c[1] for c in await f[1].characters.locate()]
        for f in found
    }

    if session_uuid:
        data = data[request_uuid(session_uuid)]
    return data


@APP_ROUTERS["character"].get("/{session_uuid}/initiative")
async def characters_find(session_uuid: str):
    """
    List initiative order for characters on the
    field. For use by player so shows limited
    info.
    """
    _, session = (await _sessions_find(session_uuid))[0]
    return {c.creature_id: c.initiative for c in session.characters}


@APP_ROUTERS["character"].post("/{session_uuid}")
async def characters_make(session_uuid: str, character: CharacterV2):
    """Create a new character"""

    character.creature_id = request_uuid()
    await _character_make(session_uuid, character)


@APP_ROUTERS["character"].patch("/{session_uuid}/{character_uuid}")
async def characters_push(session_uuid: str, character_uuid: UUID, character: CharacterV2):
    """Update the specified character."""

    await _character_make(session_uuid, character)


@APP_ROUTERS["character"].delete("/{session_uuid}/{character_uuid}")
async def characters_kill(session_uuid:str, character_uuid:UUID):
    """Delete the specified character."""

    session: CombatSession
    _, session = (await _sessions_find(session_uuid))[0]
    await session.characters.delete(character_uuid)


@APP_ROUTERS["client"].post("/")
async def clients_make():
    """
    Create a new `client_id` to be used for
    websockets and session tracking. Returns new
    clientId
    """

    return request_uuid()


@APP_ROUTERS["admin"].get("/healthcheck")
@APP_ROUTERS["admin"].get("/healthcheck/{service_name}", description="Ping a specific service.")
@APP_ROUTERS["admin"].head("/healthcheck")
async def healthcheck(service_name: str | None = None):
    """
    Ping the server, and its services, to see if
    it is online and available.
    """

    if service_name:
        statuses = []
        result   = check_application_service(service_name)
    else:
        statuses = check_application()
        result   = {"status": ServiceStatus.ONLINE, "services": statuses}

    for status in statuses:
        if status["status"] not in (ServiceStatus.ONLINE, ServiceStatus.ACTIVE):
            result["status"] = ServiceStatus.FAILING
            break

    return {"count": 1, "results": [result]}


@APP_ROUTERS["session"].websocket("/{session_uuid}/ws")
async def sessions_join(sock: WebSocket, session_uuid: str, event: JoinSessionRequest):
    """
    Join an active session. Passes in some
    arbitrary `client_uuid`.
    """

    await sock.accept()

    _, session = (await _sessions_find(session_uuid))[0]
    # TODO: Replace the lower code with new
    # interfaces for `Character` types and event
    # types.
    _ = await session.attach_client(sock)

    # Probably use attach_clients
    if(event.type == "player"):
        kwds = dict(id="", name=event.name, hp=500, conditions=[])
        _, character = await APP_SERIVCES["characters"].create(**kwds)
    # If this returns the character id after
    # adding to character list, the UI could use
    # the standard character CRUD endpoints for hp
    # and condition updates that show on dm
    # dashboard.


@APP_ROUTERS["session"].get("/", description="Get all active sessions.")
@APP_ROUTERS["session"].get("/{session_uuid}", description="Get a specific, active, session.")
async def sessions_find(session_uuid: str | None = None):
    """Attempt to fetch session(s)."""

    locator = APP_SERIVCES["sessions"].locate
    locator = locator(session_uuid) if session_uuid else locator()
    return [session_uuid for session_uuid, _ in await locator]


@APP_ROUTERS["session"].post("/")
async def sessions_make():
    """
    Create a new joinable session. Returns new
    `session_uuid`.
    """

    return (await APP_SERIVCES["sessions"].create())[0]


@APP_ROUTERS["session"].post("/{session_uuid}")
async def sessions_stop(session_uuid: str):
    """Ends an active session."""

    await APP_SERIVCES["sessions"].delete(session_uuid)


# I just created an arbirtrary endpoints. Subject
# to change. Request body structure to change.
@APP_ROUTERS["session"].get("/{idn}/player-input")
async def sessions_player_input_find(idn: str):
    """
    Get all player inputs.
    """

    return PlayerInputService.getAll()


@APP_ROUTERS["session"].post("/{idn}/player-input")
async def sessions_player_input_send(idn: str, request:PlayerInput):
    """
    Send a player input to session.
    """

    PlayerInputService.add(request)
    # this sends a websocket event to the dm
    # connected.
    event = EventMessage(event_type=EventType.DM_RECEIVE_ROLL, event_body="test")
    await manager.send_dm_session_event("", event)


@APP_ROUTERS["session"].post("/{idn}/request-player-input")
async def sessions_player_input_request(idn: str, request:RequestPlayerInput):
    """
    Requests player input based on requeust parameters.
    """
    # this sends a websocket event to the players
    # connected.

    event_body_string = dict(diceType=request.diceType, reason=request.reason)

    # request.recipient could be all or just a
    # specific player.
    body = event_body_string
    if(request.recipient == "All"):
        body = request.reason

    event = EventMessage(
        event_type=EventType.PLAYER_REQUEST_ROLL,
        event_body=body
    )
    # Send the request to a single player
    # using client id lookup. Need to
    # implement that functionality.
    await manager.send_player_session_event("", event)


@APP_ROUTERS["session"].post("/{idn}/secret")
async def sessions_player_secret(idn: str, request: PlayerSecret):
    """
    Send a secret to to a specific player.
    """
    # this sends a websocket event to a specific
    # player based on reqeust.clientId.
    event = EventMessage(
        event_type=EventType.PLAYER_RECEIVE_SECRET,
        event_body=request.secret
    )
    await manager.send_player_session_event("", event)



@app.websocket_route("/ws")
async def session_sock(sock: WebSocket, *args, **kwds):
    """Initiate a session `WebSocket`"""

    import logging

    logger = logging.getLogger("uvicorn")
    logger.info(f"Recieved connection {sock}")

    await manager.connect(sock, sock.query_params["type"] == Role.PLAYER)

    try:
        while True:
            data = await sock.receive_text()
            # this sends a websocket event to all players. 
            # I am triggering it for all incoming messages. 
            # This trigger has been moved to sessions/{idn}/request-player-input
            await manager.send_player_session_event("", EventMessage(event_type=EventType.PLAYER_REQUEST_ROLL, event_body="test"))
    except WebSocketDisconnect: 
        manager.disconnect(sock)


if __name__ == "__main__":
    # .\.venv\Scripts\python.exe -m src.scryer.app
    import uvicorn
    uvicorn.run(setup_application())

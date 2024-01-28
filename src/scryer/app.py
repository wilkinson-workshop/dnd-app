"""
The HTTP server core implementation.
"""

import pathlib
import typing

# Third-party dependencies.
from fastapi import (
    APIRouter, 
    FastAPI, 
    HTTPException, 
    Path,
    Query,
    WebSocket, 
)
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Project level modules go here.
from scryer import events
from scryer.creatures import CharacterV2, Role, HitPoints
from scryer.services import ServiceStatus, sessions
from scryer.services.sessions import CombatSession, SessionMemoryBroker
from scryer.util import request_uuid, UUID


# Root directory appliction is being executed
# from. Will be used for creating and
# fetching assets related to the application.
EXECUTION_ROOT   = pathlib.Path.cwd()
APPLICATION_ROOT = pathlib.Path(__file__).parent
SOURCE_ROOT      = APPLICATION_ROOT.parent


class JoinSessionRequest(BaseModel):
    client_uuid: UUID
    name:        str
    role:        Role


# this is the reqeust and response class for
# sending dice roles from player to dm.
class PlayerInput(BaseModel):
    value:       int
    name:        str
    client_uuid: str


# This is the reqeust of the player(s) to submit a
# dice role for use by the dm. 
# Recipient value could be All for all players or
# a specific client id to send the notification to
# ony one.    
class RequestPlayerInput(BaseModel):
    dice_type:   int
    recipients:  list[str]
    reason:      str


# this is the reqeust for sending secrets from dm
# to player
class PlayerSecret(BaseModel):
    secret:       str
    recipients:   list[str]



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


async def _character_make(
        session_uuid: UUID | str,
        character: CharacterV2,
        character_uuid: UUID | None = None):

    session: CombatSession

    _, session = (await _sessions_find(session_uuid))[0]
    character_uuid = character_uuid or character.creature_uuid
    await session.characters.modify(character_uuid, character)
    return character_uuid


async def _sessions_find(session_uuid: UUID | str | None = None):
    if isinstance(session_uuid, str):
        session_uuid = request_uuid(session_uuid)

    locator = APP_SERIVCES["sessions"].locate
    locator = locator(session_uuid) if session_uuid else locator()

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
app = FastAPI(debug=True)


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
async def characters_find(session_uuid: UUID | None = None):
    """List current characters on the field."""

    found = await _sessions_find(session_uuid)
    data  = {
        f[1].session_uuid: [c[1] for c in await f[1].characters.locate()]
        for f in found
    }

    if session_uuid:
        data = data[session_uuid]
    return data


@APP_ROUTERS["character"].get("/{session_uuid}/initiative")
async def characters_find(session_uuid: UUID):
    """
    List initiative order for characters on the
    field. For use by player so shows limited
    info.
    """
    _, session = (await _sessions_find(session_uuid))[0]

    initiatives = []
    for c in session.characters:
        initiatives.append({"id": c.creature_id, "name": c.name})

    return initiatives      


@APP_ROUTERS["character"].post("/{session_uuid}")
async def characters_make(session_uuid: UUID, character: CharacterV2):
    """Create a new character"""

    character.creature_id = request_uuid()
    await _character_make(session_uuid, character)

    await manager.send_player_session_event("",EventMessage(event_type=EventType.PLAYER_RECEIVE_ORDER_UPDATE, event_body='update') )

@APP_ROUTERS["character"].patch("/{session_uuid}/{character_uuid}")
async def characters_push(
    session_uuid: UUID,
    character_uuid: UUID,
    character: CharacterV2):
    """Update the specified character."""

    await _character_make(session_uuid, character, character_uuid)


@APP_ROUTERS["character"].delete("/{session_uuid}/{character_uuid}")
async def characters_kill(session_uuid: UUID, character_uuid: UUID):
    """Delete the specified character."""

    session: CombatSession
    _, session = (await _sessions_find(session_uuid))[0]
    await session.characters.delete(character_uuid)


@APP_ROUTERS["client"].post("/")
async def clients_make():
    """
    Create a new `client_id` to be used for
    websockets and session tracking. Returns new
    client `UUID`
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
async def sessions_join(
        sock: WebSocket,
        session_uuid: typing.Annotated[str, Path()],
        client_uuid: typing.Annotated[UUID | None, Query()] = None,
        name: typing.Annotated[str | None, Query()] = None,
        role: typing.Annotated[Role | None, Query()] = None):
    """
    Join an active session. Passes in some
    arbitrary `client_uuid`.
    """

    await sock.accept()
    _, session  = (await _sessions_find(session_uuid))[0]
    client_uuid = await session.attach_client(sock)
    if(role is Role.PLAYER):
        ch = CharacterV2(
            conditions=[],
            hit_points=HitPoints(0),
            creature_id=client_uuid,
            initiative=-1,
            name=name)
        await _character_make(session_uuid, ch)


@APP_ROUTERS["session"].get("/", description="Get all active sessions.")
@APP_ROUTERS["session"].get("/{session_uuid}", description="Get a specific, active, session.")
async def sessions_find(session_uuid: UUID | None = None):
    """Attempt to fetch session(s)."""

    locator = APP_SERIVCES["sessions"].locate
    locator = locator(session_uuid) if session_uuid else locator()
    return [sxn.session_uuid for _, sxn in await locator]


@APP_ROUTERS["session"].post("/")
async def sessions_make():
    """
    Create a new joinable session. Returns new
    `session_uuid`.
    """

    return (await APP_SERIVCES["sessions"].create())[0]


@APP_ROUTERS["session"].delete("/{session_uuid}")
async def sessions_stop(session_uuid: UUID):
    """Ends an active session."""

    await APP_SERIVCES["sessions"].delete(session_uuid)


# I just created an arbirtrary endpoints. Subject
# to change. Request body structure to change.
@APP_ROUTERS["session"].get("/{session_uuid}/player-input")
async def sessions_player_input_find(session_uuid: UUID):
    """
    Get all player inputs.
    """

    return PlayerInputService.getAll()


@APP_ROUTERS["session"].post("/{session_uuid}/player-input")
async def sessions_player_input_send(session_uuid: UUID, body: PlayerInput):
    """
    Send a player input to session.
    """

    PlayerInputService.add(body)

    await (await _sessions_find(session_uuid))[0][1].broadcast_action(
        sessions.dungeon_master_send_event,
        event=events.ReceiveRoll()
    )


@APP_ROUTERS["session"].post("/{session_uuid}/request-player-input")
async def sessions_player_input_request(
        session_uuid: UUID,
        body: RequestPlayerInput):
    """
    Requests player input based on request parameters.
    """

    await (await _sessions_find(session_uuid))[0][1].broadcast_action(
        sessions.player_send_event,
        event=events.RequestRoll(event_body=body)
    )


@APP_ROUTERS["session"].post("/{session_uuid}/secret")
async def sessions_player_secret(session_uuid: UUID, body: PlayerSecret):
    """
    Send a secret to to a specific player.
    """

    await (await _sessions_find(session_uuid))[0][1].broadcast_action(
        sessions.player_send_event,
        event=events.ReceiveSecret(event_body=body.secret)
    )


if __name__ == "__main__":
    # .\.venv\Scripts\python.exe -m src.scryer.app
    import uvicorn
    uvicorn.run(setup_application())

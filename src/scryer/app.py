"""
The HTTP server core implementation.
"""

import json
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
    WebSocketDisconnect
)
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Project level modules go here.
from scryer.creatures import CharacterV2, Condition, Role, HitPoints
from scryer.services import ServiceStatus, sessions
from scryer.services.sessions import Action, CombatSession, SessionMemoryBroker
from scryer.util import events, request_uuid, UUID

# Root directory appliction is being executed
# from. Will be used for creating and
# fetching assets related to the application.
EXECUTION_ROOT   = pathlib.Path.cwd()
APPLICATION_ROOT = pathlib.Path(__file__).parent
SOURCE_ROOT      = APPLICATION_ROOT.parent


class CreaturesFilter(typing.TypedDict):
    hit_points: int
    role:       typing.Sequence[Role]
    condition:  typing.Sequence[Condition]


async def _broadcast_client_event(
        session_uuid: UUID,
        action: Action,
        cls: type[events.Event],
        body: events.EventBody,
        **kwds):

    _, session = (await _sessions_find(session_uuid))[0]
    return await session.broadcast_action(action, event=cls(body, **kwds))


async def _broadcast_dm_event(
        session_uuid: UUID,
        cls: type[events.Event]):

    return await _broadcast_client_event(
        session_uuid,
        sessions.dm_send_event_action,
        cls,
        events.EventBody())


async def _broadcast_pc_event(
        session_uuid: UUID,
        cls: type[events.Event],
        body: events.EventBody):

    return await _broadcast_client_event(
        session_uuid,
        sessions.pc_send_event_action,
        cls,
        body)


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
app = FastAPI(
    root_path="/api/",
    title="Scryer",
    version="1.0.0",
    description="Interactive D&D combat companion REST API."
)


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
    ("/static", StaticFiles(directory=APPLICATION_ROOT / "static", html=True)),
)


@APP_ROUTERS["character"].get("/")
@APP_ROUTERS["character"].get("/{session_uuid}")
async def characters_find(
        session_uuid: UUID | None = None, 
        query: str = Query("")):
    """List current characters on the field."""

    query = json.loads(query) if query else None
    found = await _sessions_find(session_uuid)
    data  = {
        f[1].session_uuid: [
            c[1] for c in await f[1].characters.locate(statement=query)]
        for f in found
    }

    if session_uuid:
        data = data[session_uuid]

    return sorted(data, key=lambda e: e.initiative)


@APP_ROUTERS["character"].get("/{session_uuid}/initiative")
async def characters_find(session_uuid: UUID):
    """
    List initiative order for characters on the
    field. For use by player so shows limited
    info.
    """
    _, session = (await _sessions_find(session_uuid))[0]

    initiatives = []
    for c in sorted(session.characters, key=lambda c: c.initiative):
        initiatives.append({"id": c.creature_id, "name": c.name,})

    return initiatives      


@APP_ROUTERS["character"].post("/{session_uuid}")
async def characters_make(session_uuid: UUID, character: CharacterV2):
    """Create a new character"""

    character.creature_id = request_uuid()
    await _character_make(session_uuid, character)
    await _broadcast_pc_event(
        session_uuid,
        events.ReceiveOrderUpdate,
        body=events.EventBody())


@APP_ROUTERS["character"].patch("/{session_uuid}/{character_uuid}")
async def characters_push(
    session_uuid: UUID,
    character_uuid: UUID,
    character: CharacterV2):
    """Update the specified character."""

    await _character_make(session_uuid, character, character_uuid)
    await _broadcast_pc_event(
        session_uuid,
        events.ReceiveOrderUpdate,
        body=events.EventBody())


@APP_ROUTERS["character"].delete("/{session_uuid}/{character_uuid}")
async def characters_kill(session_uuid: UUID, character_uuid: UUID):
    """Delete the specified character."""

    session: CombatSession
    _, session = (await _sessions_find(session_uuid))[0]
    await session.characters.delete(character_uuid)
    await _broadcast_pc_event(
        session_uuid,
        events.ReceiveOrderUpdate,
        body=events.EventBody())


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
        name: typing.Annotated[str | None, Query()] = None,
        hit_points: typing.Annotated[HitPoints | None, Query()] = None,
        role: typing.Annotated[Role | None, Query()] = None):
    """
    Join an active session. Passes in some
    arbitrary `client_uuid`.
    """

    session: CombatSession

    await sock.accept()
    _, session  = (await _sessions_find(session_uuid))[0]
    client_uuid = await session.attach_client(sock)
    if role is Role.PLAYER:
        ch = CharacterV2(
            conditions=[],
            hit_points=hit_points or HitPoints(500, 500),
            creature_id=client_uuid,
            initiative=-1,
            role=role,
            name=name)
        await _character_make(session_uuid, ch)
        await _broadcast_dm_event(
            session_uuid,
            events.ReceiveOrderUpdate)
        await _broadcast_pc_event(
            session_uuid,
            events.ReceiveOrderUpdate,
            body=events.EventBody())

    try:
        while True:
            # TODO: need to accept messages from
            # clients via this event loop.
            data = await sock.receive_text()
    except (WebSocketDisconnect, RuntimeError):
        # Must ensure invalid/disconnected
        # clients are removed.
        if role is Role.PLAYER:
            await session.characters.delete(client_uuid)
        await session.detach_client(sock)


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


@APP_ROUTERS["session"].get("/{session_uuid}/player-input")
async def sessions_player_input_find(session_uuid: UUID):
    """
    Get all player inputs.
    """

    session: CombatSession

    _, session = (await _sessions_find(session_uuid))[0]
    data = [
        event for event in session.events
        if isinstance(event, events.PlayerInput)
    ]
    return data


@APP_ROUTERS["session"].post("/{session_uuid}/player-input")
async def sessions_player_input_send(session_uuid: UUID, body: events.PlayerInput):
    """
    Send a player input to session.
    """

    session: CombatSession

    _, session = (await _sessions_find(session_uuid))[0]
    session.events.append(body)
    await _broadcast_dm_event(session_uuid, events.ReceiveRoll)


@APP_ROUTERS["session"].delete("/{session_uuid}/player-input")
async def sessions_player_input_find(session_uuid: UUID):
    """
    Get all player inputs.
    """

    session: CombatSession

    _, session = (await _sessions_find(session_uuid))[0]
    predicate  = lambda e: isinstance(e, events.PlayerInput)
    for event in filter(predicate, session.events):
        session.events.remove(event)


@APP_ROUTERS["session"].post("/{session_uuid}/request-player-input")
async def sessions_player_input_request(
        session_uuid: UUID,
        body: events.RequestPlayerInput):
    """
    Requests player input based on request parameters.
    """

    await _broadcast_pc_event(
        session_uuid,
        events.RequestRoll,
        body)


@APP_ROUTERS["session"].post("/{session_uuid}/secret")
async def sessions_player_secret(
    session_uuid: UUID,
    body: events.PlayerSecret):
    """
    Send a secret to to a specific player.
    """

    print(body)
    await _broadcast_pc_event(
        session_uuid,
        events.ReceiveSecret,
        body)


if __name__ == "__main__":
    # .\.venv\Scripts\python.exe -m src.scryer.app
    import uvicorn
    uvicorn.run(setup_application())

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
from scryer.creatures import CharacterV2, MutlipleCharactersV2
from scryer.services import (
    Action,
    Broker,
    CombatSession,
    EventMemoryBroker,
    Service,
    ServiceStatus,
    Session,
    SessionMemoryBroker,
    SessionRedisBroker,
    SessionSocket,
    SocketMemoryBroker,
    sessions,
    send_event_action
)
from scryer.util import events, request_uuid, UUID
from scryer.util.events import *
from scryer.util.events import NewCurrentOrder
from scryer.util.session_group import SessionGroup, SessionGroupApi

# Root directory appliction is being executed
# from. Will be used for creating and
# fetching assets related to the application.
EXECUTION_ROOT   = pathlib.Path.cwd()
APPLICATION_ROOT = pathlib.Path(__file__).parent
SOURCE_ROOT      = APPLICATION_ROOT.parent


async def _broadcast_client_event[**P](
        session_uuid: UUID,
        action: Action,
        cls: typing.Callable[P, events.Event],
        body: events.EventBody,
        **kwds):

    _, session = (await _sessions_find(session_uuid))[0]
    return await session.broadcast_action(action, event=cls(body, **kwds)) #type: ignore

async def _broadcast_session_event(
        session_uuid: UUID,
        cls: type[events.Event],
        body: events.EventBody):

    return await _broadcast_client_event(
        session_uuid,
        sessions.all_send_event_action,
        cls,
        body)

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

    _, session = (await _sessions_find(session_uuid))[0] #type: ignore
    character_uuid = character_uuid or character.creature_uuid
    await session.characters.modify(character_uuid, character)
    return character_uuid

async def _group_character_make(
        session_uuid: UUID | str,
        group_uuid: UUID | str,
        character: CharacterV2,
        character_uuid: UUID | None = None):

    session: CombatSession

    _, session = (await _sessions_find(session_uuid))[0] #type: ignore
    _, group = (await session.groups.locate(group_uuid))[0] #type: ignore
    character_uuid = character_uuid or character.creature_uuid
    await group.characters.modify(character_uuid, character)
    return character_uuid


async def _sessions_find(session_uuid: UUID | str | None = None):
    broker: Broker[UUID, CombatSession] = APP_SERIVCES["sessions00"] #type: ignore
    keys = (request_uuid(session_uuid),) if session_uuid else ()

    found = await broker.locate(*keys)
    if not found and session_uuid:
        raise HTTPException(404, f"No session at {session_uuid}")
    return found

async def join_session(sock, data) -> UUID:
    body: SessionJoinBody = data['event_body']
    _, session  = (await _sessions_find(body['session_uuid']))[0]
    client_uuid = await session.attach_client(sock, body)
    if body['role'] == 'player':
        await _broadcast_session_event(
            request_uuid(session.session_uuid),
            events.ReceiveOrderUpdate, #type: ignore
            body = events.EventBody())
    
    return client_uuid


# -----------------------------------------------
# Appliction Services.
# -----------------------------------------------
APP_SERIVCES: typing.Mapping[str, Service] = {
    "events00": EventMemoryBroker(Event),
    "sessions00": SessionMemoryBroker(CombatSession),
    "sessions01": SessionRedisBroker(
        CombatSession,
        "redis://default:redispw@localhost:32768"
    ),
    "sockets00": SocketMemoryBroker(SessionSocket)
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
    # Define session group manipulation
    # endpoints.
    "group": APIRouter(prefix="/groups"),
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

async def session_order_current(session: CombatSession, ordered_list: list[CharacterV2]):
    current_top = session.session_current_character
    if(current_top == None and len(ordered_list) > 0):
        #set default if it isn't set
        current_top = ordered_list[0].creature_uuid
        session.set_current_character(current_top)        
    elif(len(ordered_list) == 0):
        return ordered_list

    found_Current_character = await session.characters.locate(current_top)
    if(len(found_Current_character) == 0):
        # There are situations when the curent position was deleted. 
        # In that case reset the current position
        current_top = ordered_list[0].creature_uuid # TODO look for a better default if the current position was deleted. The next in position?
        session.set_current_character(current_top)
        found_Current_character = await session.characters.locate(current_top)

    _, current_character = found_Current_character[0]
    current_index = ordered_list.index(current_character)
    current_after = [ordered_list[i] for i in range(current_index, len(ordered_list))]
    current_pre = [ordered_list[i] for i in range(0, current_index)]
    return [*current_after, *current_pre]


@APP_ROUTERS["character"].get("/{session_uuid}")
async def characters_find(
        session_uuid: UUID, 
        query: str = Query("")):
    """List current characters on the field."""

    statement = json.loads(query) if query else None #type: ignore
    _, session = (await _sessions_find(session_uuid))[0]
    data  =  [c for _, c in await session.characters.locate(statement=statement)]

    ordered_list = sorted(data, key=lambda c: c.initiative, reverse=True) #type: ignore
    
    if(statement['filters'] and statement['filters'][0]['value'] == 'player'):
        return ordered_list

    return await session_order_current(session, ordered_list)


@APP_ROUTERS["character"].get("/{session_uuid}/player")
async def characters_find_player(session_uuid: UUID):
    """
    List initiative order for characters on the
    field. For use by player so shows limited
    info.
    """

    _, session = (await _sessions_find(session_uuid))[0]
    ordered = sorted(session.characters, key=lambda c: c.initiative, reverse=True) #type: ignore

    return await session_order_current(session, ordered)


@APP_ROUTERS["character"].post("/{session_uuid}")
async def characters_make(session_uuid: UUID, character: CharacterV2):
    """Create a new character"""

    character.creature_id = request_uuid()
    await _character_make(session_uuid, character)
    await _broadcast_pc_event(
        session_uuid,
        events.ReceiveOrderUpdate, #type: ignore
        body=events.EventBody())
        
@APP_ROUTERS["character"].post("/{session_uuid}/multiple")
async def characters_make(session_uuid: UUID, body: MutlipleCharactersV2):
    """Create a new character"""

    for character in body.characters:
        character.creature_id = request_uuid()
        await _character_make(session_uuid, character)
    await _broadcast_pc_event(
        session_uuid,
        events.ReceiveOrderUpdate, #type: ignore
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
        events.ReceiveOrderUpdate, #type: ignore
        body=events.EventBody())


@APP_ROUTERS["character"].delete("/{session_uuid}/{character_uuid}")
async def characters_kill(session_uuid: UUID, character_uuid: UUID):
    """Delete the specified character."""

    session: CombatSession
    _, session = (await _sessions_find(session_uuid))[0]
    await session.characters.delete(character_uuid)

    # do we want to forcefully disconnect a player if their character is "killed"
    if (found := await session.clients.locate(character_uuid)): 
        _, client = found[0] 
        await session.detach_client(client)

    await _broadcast_pc_event(
        session_uuid,
        events.ReceiveOrderUpdate, #type: ignore
        body=events.EventBody())
    



@APP_ROUTERS["group"].get("/{session_uuid}", description="Get all session groups.")
#@APP_ROUTERS["group"].get("/{session_uuid}/{group_uuid}", description="Get a specific, session group.")
async def get_groups(
    session_uuid: UUID):
    """Attempt to fetch session(s)."""

    _, session = (await _sessions_find(session_uuid))[0]
    found  = await session.groups.locate()

    def mapper(sxn: SessionGroup): 
        return SessionGroupApi( 
            group_uuid=sxn.group_uuid, 
            group_name=sxn.group_name) 
    return [mapper(sxn) for _, sxn in found]


@APP_ROUTERS["group"].post("/{session_uuid}")
async def group_make(
    session_uuid: UUID,
    group: SessionGroupApi):
    """
    Create a new group. Returns new
    `group_uuid`.
    """

    _, session = (await _sessions_find(session_uuid))[0]

    return (await session.groups.create(
        group.group_name, #type: ignore
        ))[0] #type: ignore


@APP_ROUTERS["group"].delete("/{session_uuid}/{group_uuid}")
async def group_delete(
    session_uuid: UUID,
    group_uuid: UUID):
    """Ends an active session."""

    _, session = (await _sessions_find(session_uuid))[0]

    await session.groups.delete(group_uuid)



@APP_ROUTERS["group"].get("/{session_uuid}/{group_uuid}")
async def get_group_characters(
        session_uuid: UUID,
        group_uuid: UUID):
    """List current characters in the group"""

    _, session = (await _sessions_find(session_uuid))[0]
    _, group  =  (await session.groups.locate(group_uuid))[0]
    data  =  [c for _, c in await group.characters.locate()]

    ordered_list = sorted(data, key=lambda c: c.initiative, reverse=True) #type: ignore
    return ordered_list


@APP_ROUTERS["group"].post("/{session_uuid}/{group_uuid}")
async def group_characters_make(
    session_uuid: UUID, 
    group_uuid: UUID,
    character: CharacterV2):
    """Create a new character"""

    character.creature_id = request_uuid()
    await _group_character_make(session_uuid, group_uuid, character)

        
@APP_ROUTERS["group"].post("/{session_uuid}/{group_uuid}/multiple")
async def characters_make(
    session_uuid: UUID, 
    group_uuid: UUID,
    body: MutlipleCharactersV2):
    """Create a new character"""

    for character in body.characters:
        character.creature_id = request_uuid()
        await _group_character_make(session_uuid, group_uuid, character)  


@APP_ROUTERS["group"].patch("/{session_uuid}/{group_uuid}/{character_uuid}")
async def characters_push(
    session_uuid: UUID,
    group_uuid: UUID,
    character_uuid: UUID,
    character: CharacterV2):
    """Update the specified character."""

    await _group_character_make(session_uuid, group_uuid, character, character_uuid)



@APP_ROUTERS["group"].delete("/{session_uuid}/{group_uuid}/{character_uuid}")
async def characters_kill(
    session_uuid: UUID, 
    group_uuid: UUID,
    character_uuid: UUID):
    """Delete the specified character."""

    session: CombatSession
    _, session = (await _sessions_find(session_uuid))[0]
    _, group  =  (await session.groups.locate(group_uuid))[0]
    await group.characters.delete(character_uuid)





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
async def sessions_join(sock: WebSocket, session_uuid: typing.Annotated[str, Path()]):

    """
    Join an active session. This worflow works similar to an auth workflow.
    First initiate a connection which sends back a confirmation event.
    That triggers the UI to send info needed to join the session.
    This triggers the websocket to sent a client id back to the UI to be used for identification
    """

    session: CombatSession

    _, session = (await _sessions_find(session_uuid))[0]

    await sock.accept()

    await send_event_action(
        sock,
        events.JoinSession(events.EventBody()))
        
    try:
        while True:
            data: Event = await sock.receive_json()
            match data['event_type']:
                case events.EventType.JOIN_SESSION:                    
                    current_client_uuid = await join_session(sock, data)
                    await send_event_action(
                        sock,
                        events.ReceiveClientUUID(
                            ClientUUID(client_uuid=str(current_client_uuid))
                        )   
                    )                 

    except (WebSocketDisconnect, RuntimeError):
        #remove the socket from all groups
        await session.detach_client(sock)

@APP_ROUTERS["session"].get("/", description="Get all active sessions.")
@APP_ROUTERS["session"].get("/{session_uuid}", description="Get a specific, active, session.")
async def sessions_find(session_uuid: UUID | None = None):
    """Attempt to fetch session(s)."""

    found = await _sessions_find(session_uuid)

    def mapper(sxn: Session): 
        return sessions.SessionApi( 
            session_uuid=sxn.session_uuid, 
            session_name=sxn.session_name, 
            session_description=sxn.session_description) 
    return [mapper(sxn) for _, sxn in found]


@APP_ROUTERS["session"].post("/")
async def sessions_make(session: sessions.SessionApi):
    """
    Create a new joinable session. Returns new
    `session_uuid`.
    """

    clients:  Broker[UUID, SessionSocket] = APP_SERIVCES["sockets00"] #type: ignore
    events:   Broker[UUID, Event]         = APP_SERIVCES["events00"] #type: ignore
    sessions: Broker[UUID, CombatSession] = APP_SERIVCES["sessions00"] #type: ignore
    return (await sessions.create(
        session.session_name, #type: ignore
        clients,
        events,
        session.session_description))[0] #type: ignore


@APP_ROUTERS["session"].delete("/{session_uuid}")
async def sessions_stop(session_uuid: UUID):
    """Ends an active session."""

    sessions: Broker[UUID, CombatSession] = APP_SERIVCES["sessions00"] #type: ignore

    await _broadcast_session_event(
        request_uuid(session_uuid),
        events.EndSession, #type: ignore
        body = events.EventBody())

    await sessions.delete(session_uuid)

@APP_ROUTERS["session"].post("/{session_uuid}/initiative-order")
async def sessions_player_input_send(session_uuid: UUID, body: NewCurrentOrder):
    """
    Update the current character in the initiative order for the session.
    """

    session: CombatSession

    _, session  = (await _sessions_find(session_uuid))[0]
    new_current = request_uuid(body.creature_uuid) if body.creature_uuid != None else None
    session.set_current_character(new_current)

    await _broadcast_pc_event(
        request_uuid(session_uuid),
        events.ReceiveOrderUpdate, #type: ignore
        body = events.EventBody())


@APP_ROUTERS["session"].get("/{session_uuid}/player-input")
async def sessions_player_input_find(session_uuid: UUID):
    """
    Get all player inputs.
    """

    session: CombatSession

    _, session = (await _sessions_find(session_uuid))[0]
    data = [
        dump_event(event) for _, event in (await session.owned_events())
        if event.event_type == events.EventType.RECEIVE_ROLL
    ]
    return data


@APP_ROUTERS["session"].post("/{session_uuid}/player-input")
async def sessions_player_input_send(session_uuid: UUID, event: events.PlayerInput):
    """
    Send a player input to session.
    """

    ch: CharacterV2
    session: CombatSession

    _, session  = (await _sessions_find(session_uuid))[0]

    if(event.reason == "Initiative"):
        found = await session.characters.locate(request_uuid(event.client_uuid))
        if found:
            ch = found[0][1] #type: ignore
            ch.initiative = float(event.value)
            await _character_make(
                session_uuid, 
                ch, 
                ch.creature_uuid)
            await _broadcast_session_event(
                session_uuid, 
                events.ReceiveOrderUpdate, #type: ignore
                body=events.EventBody())
    else:
        await APP_SERIVCES["events00"].create( 
            session_uuid, #type: ignore 
            event, #type: ignore 
            events.ReceiveRoll) #type: ignore
        
        await _broadcast_dm_event(
            session_uuid, 
            events.ReceiveRoll) #type: ignore


@APP_ROUTERS["session"].delete("/{session_uuid}/player-input")
async def sessions_player_input_clear(session_uuid: UUID):
    """
    Get all player inputs.
    """

    session: CombatSession

    _, session = (await _sessions_find(session_uuid))[0]
    for event_uuid, event in await session.owned_events():
        if isinstance(event.event_body, events.PlayerInput):
            await session.events.delete(event_uuid)


@APP_ROUTERS["session"].post("/{session_uuid}/request-player-input")
async def sessions_player_input_request(
        session_uuid: UUID,
        body: events.RequestPlayerInput):
    """
    Requests player input based on request parameters.
    """

    await _broadcast_pc_event(
        session_uuid,
        events.RequestRoll, #type: ignore
        body)


@APP_ROUTERS["session"].post("/{session_uuid}/message")
async def sessions_player_secret(
    session_uuid: UUID,
    body: events.PlayerMessage):
    """
    Send a messsage to to player(s).
    """

    await _broadcast_pc_event(
        session_uuid,
        events.ReceiveMessage, #type: ignore
        body)


if __name__ == "__main__":
    # .\.venv\Scripts\python.exe -m src.scryer.app
    import uvicorn
    uvicorn.run(setup_application())

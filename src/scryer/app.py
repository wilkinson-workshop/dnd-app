"""
The HTTP server core implementation.
"""

import asyncio
import pathlib
import uuid

# Third-party dependencies.
import uvicorn
from fastapi.responses import JSONResponse
from fastapi import APIRouter, FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from scryer.asyncit import _aiter
from scryer.services import ServiceStatus
from scryer.services.sessions import Session, SessionShelver

# Root directory appliction is being executed
# from. Will be used for creating and
# fetching assets related to the application.
EXECUTION_ROOT = pathlib.Path.cwd()


# Should change to use legit type in the future
class Character(BaseModel):
    id:         str
    name:       str
    hp:         int
    conditions: list[int]


# Service layer working with in-memory data
class CharacterService():
    __characters:list[Character]= []

    @classmethod
    def get(cls):
        return cls.__characters

    @classmethod
    def add(cls, character):
        character.id = str(uuid.uuid1())
        cls.__characters.append(character)
        return
    
    @classmethod
    def edit(cls, id:str, character:Character):
        for index, item in enumerate(cls.__characters):
            if item.id == id:
                cls.__characters[index] = character
        return
    
    @classmethod
    def delete(cls, id: str):
        for index, item in enumerate(cls.__characters):
            if item.id == id:
                cls.__characters.remove(item)
        return


# -----------------------------------------------
# Appliction Services.
# -----------------------------------------------
APP_SERIVCES = {
    "sessions": SessionShelver("scryer_sessions", Session),
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
    # Define character/creature manipulation
    # endpoints.
    "character": APIRouter(),
    # Defines the routes available at the root of our
    # HTTP server.
    "root": APIRouter(),
    # Defines the routes available to managing
    # game sessions.
    "session": APIRouter()
}

# -----------------------------------------------
# External ASGI applications.
# -----------------------------------------------
# The defined applications are to be mounted by
# the root application later. Will be used for
# serving additional materials to the front-end.
ASGI_APP_MOUNTS = (
    ("/static", StaticFiles(directory=EXECUTION_ROOT / "static", html=True)),
)


@APP_ROUTERS["character"].get("/characters")
async def character_list():
    """List current characters on the field."""

    return CharacterService.get()


@APP_ROUTERS["character"].post("/characters")
async def character_add(character: Character):
    """Add a new character"""

    CharacterService.add(character);


@APP_ROUTERS["character"].patch("/characters/{id}")
async def character_modify(id:str, character: Character):
    """Update the Specified character"""

    CharacterService.edit(id, character)


@APP_ROUTERS["character"].delete("/characters/{id}")
async def character_delete(id:str):
    """Update the Specified character"""

    CharacterService.delete(id);
    return JSONResponse(None)


@APP_ROUTERS["root"].get("/healthcheck")
@APP_ROUTERS["root"].head("/healthcheck")
async def healthcheck():
    """
    Ping the server, and its services, to see if
    it is online and available.
    """

    statuses = check_application()
    result   = {"status": ServiceStatus.ONLINE, "services": statuses}
    for status in statuses:
        if status["status"] not in (ServiceStatus.ONLINE, ServiceStatus.ACTIVE):
            result["status"] = ServiceStatus.FAILING
            break

    return {"count": 1, "results": [result]}


@APP_ROUTERS["root"].get("/healthcheck/{service}")
async def healthcheck_service(service: str):
    """
    Ping the server, and its services, to see if
    it is online and available.
    """

    return {"count": 1, "results": [check_application_service(service)]}


@APP_ROUTERS["session"].patch("/sessions/{idn}")
async def sessions_join(idn: str):
    """Join an active session."""

    return NotImplemented


@APP_ROUTERS["session"].get("/sessions")
async def sessions_list():
    """List active sessions."""

    return NotImplemented


@APP_ROUTERS["session"].post("/sessions")
async def sessions_make():
    """Create a new joinable session."""

    return NotImplemented


@APP_ROUTERS["session"].websocket("socket")
async def session_sock(sock: WebSocket):
    """Initiate a session `WebSocket`"""

    await sock.accept()
    while True:
        data = await sock.receive_text()
        await sock.send_text(f"Got {data!s} from connection.")


if __name__ == "__main__":
    # .\.venv\Scripts\python.exe -m src.scryer.app
    import uvicorn
    uvicorn.run("src.scryer.app:setup_application", reload=True)

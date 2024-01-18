"""
The HTTP server core implementation.
"""

import pathlib

# Third-party dependencies.
import click
import uvicorn
from fastapi import APIRouter, FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Root directory appliction is being executed
# from. Will be used for creating and
# fetching assets related to the application.
EXECUTION_ROOT = pathlib.Path.cwd()

# -----------------------------------------------
# Web/HTTP Application Defintion.
# -----------------------------------------------
# Initialize the application config in static
# space.
app = FastAPI()


def setup_application():
    """
    A factory function responsible for finalizing
    the appliction on each reload.
    """

    for mount in ASGI_APP_MOUNTS:
        app.mount(*mount)

    for _, router in APP_ROUTERS.items():
        app.include_router(router)

    return app


# -----------------------------------------------
# External ASGI applications.
# -----------------------------------------------
# The defined applications are to be mounted by
# the root application later. Will be used for
# serving additional materials to the front-end.
ASGI_APP_MOUNTS = (
    ("/static", StaticFiles(directory=EXECUTION_ROOT / "static", html=True)),
)

# -----------------------------------------------
# API Routes.
# -----------------------------------------------
APP_ROUTERS = {
    # Defines the routes available at the root of our
    # HTTP server.
    "root": APIRouter(),
    # Defines the routes available to managing
    # game sessions.
    "session": APIRouter()
}

@APP_ROUTERS["root"].get("/healthcheck")
@APP_ROUTERS["root"].head("/healthcheck")
async def healthcheck():
    """
    Ping the server, and its services, to see if
    it is online and available.
    """
    # TODO: implement healthcheck to ensure all
    # services are running.
    return "online"


@APP_ROUTERS["root"].get("/healthcheck/{service}")
async def healthcheck_service(service: str):
    """
    Ping the server, and its services, to see if
    it is online and available.
    """
    # TODO: implement healtcheck handling for
    # internal services.
    return "online"


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
    exit(uvicorn.run("src.scryer.app:setup_application", reload=True))

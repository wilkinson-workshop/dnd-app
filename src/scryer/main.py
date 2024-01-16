import os
import pathlib
import signal

# Third-party dependencies.
import click
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Root directory appliction is being executed
# from. Will be used for creating and
# fetching assets related to the application.
EXECUTION_ROOT = pathlib.Path.cwd()

# Initialize the application config in static
# space.
app = FastAPI()
app.mount("/static", StaticFiles(directory=EXECUTION_ROOT / "static", html=True))


@click.group(name="scryer")
def main():
    """Manage this application."""


@main.command()
@click.option("-H", "--hostname", default="localhost")
@click.option("-p", "--port", default=8000)
@click.option(
    "--headless",
    is_flag=True,
    default=False,
    help="run the web application in headless mode.")
def start(hostname: str, port: int, *, headless: bool):
    """Starts the web server."""

    uvicorn.run(app, host=hostname, port=port)


if __name__ == "__main__":
    exit(main())

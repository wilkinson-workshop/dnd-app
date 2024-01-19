"""
The CLI application. A shortcut script for loading
our application as configured per our
preferrences.
"""

import asyncio
import subprocess
import sys

import click
import uvicorn


def application_path(dev_mode: bool):
    if dev_mode:
        # Points to the project level package
        # explicitly. Ensures application is run
        # from the project and not from the
        # environment.
        return "src.scryer.app:setup_application"
    return "scryer.app:setup_appliction"


def npm(*args: str):
    """Execute npm as a subprocess."""

    subprocess.call(["npm", *args])


def pip(*args: str):
    """Execute pip as a subprocess."""

    subprocess.call([python_path(), "-m", "pip", *args])


def python_path() -> str:
    """Get the path to the Python executable."""

    return sys.executable


# -----------------------------------------------
# Command Line Interface (CLI).
# -----------------------------------------------
# Defines `scryer` as the entry point for managing
# our application.
@click.group(name="scryer")
def main():
    """Manage this application."""


@main.command()
def make():
    """
    Build this project and install into the
    environment.
    """

    # TODO: implement any setup requirements
    # for client-side application.

    # Will install this project into the active
    # environment.
    pip("install", "-U", ".")


@main.command()
@click.option("-H", "--hostname", default="localhost")
@click.option("-p", "--port", default=8000)
@click.option("--dev", is_flag=True, default=False)
@click.option("-W", "--workers", type=int, default=None)
def start(hostname: str, port: int, *, dev: bool, workers: int | None):
    """Starts the web server."""

    # TODO: implement startup for `client` app.

    kwds = dict(factory=True, host=hostname, port=port, reload=True)
    if workers:
        # Workers are ignored when 'reload' is
        # enabled. Might not want to implicitly
        # disable reload in this context.
        kwds["workers"] = workers
        kwds["reload"]  = False

    uvicorn.run(application_path(dev), **kwds) #type: ignore[arg-type]


if __name__ == "__main__":
    exit(main())

"""
The CLI application. A shortcut script for loading
our application as configured per our
preferrences.
"""
import subprocess

import click
import uvicorn


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
    subprocess.call(["pip3", "install", "-U", "."])


@main.command()
@click.option("-H", "--hostname", default="localhost")
@click.option("-p", "--port", default=8000)
@click.option("-W", "--workers", type=int, default=None)
def start(hostname: str, port: int, *, workers: int | None):
    """Starts the web server."""

    # TODO: implement startup for `client` app.

    kwds = dict(factory=True, host=hostname, port=port, reload=True)
    if workers:
        # Workers are ignored when 'reload' is
        # enabled. Might not want to implicitly
        # disable reload in this context.
        kwds["workers"] = workers
        kwds["reload"]  = False

    uvicorn.run("scryer.app:setup_application", **kwds) #type: ignore[arg-type]


if __name__ == "__main__":
    exit(main())

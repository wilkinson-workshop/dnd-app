"""
The CLI application. A shortcut script for loading
our application as configured per our
preferrences.
"""

import subprocess
import sys

import click
import uvicorn


def application_path():
    """Module path to application loader"""

    return "scryer.app:setup_application"


def npm(*args: str):
    """Execute npm as a subprocess."""

    subprocess.call(["npm", *args])


def pip(*args: str):
    """Execute pip as a subprocess."""

    subprocess.call([python_path(), "-m", "pip", *args])


def python_path() -> str:
    """Get the path to the Python executable."""

    return sys.executable


def scryer_make_api(release: bool):
    """
    Install/Update this project and its
    dependencies. If `release` is `True`, install
    this project into the environment as a
    package.
    """

    args = ["--require-virtualenv", "install", "-U"]
    if not release:
        args.append("--editable")
    pip(*args, ".")


def scryer_start_api(hostname: str, port: int, workers: int):
    """Run the REST application."""

    kwds = dict(factory=True, host=hostname, port=port, reload=True)
    if workers:
        # Workers are ignored when 'reload' is
        # enabled. Might not want to implicitly
        # disable reload in this context.
        kwds["workers"] = workers
        kwds["reload"]  = False

    uvicorn.run(application_path(), **kwds) #type: ignore[arg-type]


# -----------------------------------------------
# Command Line Interface (CLI).
# -----------------------------------------------
# Defines `scryer` as the entry point for managing
# our application.
@click.group(name="scryer")
def main():
    """Manage this application."""


@main.command()
@click.option("--release", is_flag=True, default=False)
def make(*, release: bool):
    """
    Build this project and install into the
    environment.
    """

    # TODO: implement any setup requirements
    # for client-side application.
    scryer_make_api(release)


@main.command()
@click.option("-H", "--hostname", default="localhost")
@click.option("-p", "--port", default=8000)
@click.option("-W", "--workers", type=int, default=None)
def start(hostname: str, port: int, *, workers: int | None):
    """Starts the web server."""

    # TODO: implement startup for `client` app.
    scryer_start_api(hostname, port, workers)


if __name__ == "__main__":
    exit(main())

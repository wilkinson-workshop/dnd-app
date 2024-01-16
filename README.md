# dnd-app

Applicattion architure will be Python as the backend using Flask with react for the frontend
dataset wwill be using Redis for quick storeage and retrival.
we will be using websockets for event driven workflows

# Development #

## First Steps ##
For first-time set-up of our application in development mode, you will
need to first ensure you have an appropriate version of Python 3+
available on your machine.

```bash
$ python3 --version
Python 3.12.0
```

After ensuring Python is installed on your machine, it is recommended
to initiate a virtual environment locally in this project and then
activate the venv to use it. You may name the virtual environment
whatever you like, but the recommended convention is `.venv`.

```bash
# From bash.
$ python3 -m venv .venv && source .venv/bin/activate
```

From here you can install the dependencies needed for development of
this project.

```bash
$ pip3 install -U pip && pip3 install -U .
```

The above command chain will update `pip` the Python package manager
and install our application as a package into the virtual environment.
For most Python projects, this would be superfluous, however I've
set up our application with a quick shortcut cli for easy start up.

```
$ scryer --help
Usage: scryer [OPTIONS] COMMAND [ARGS]...

  Manage this application.

Options:
  --help  Show this message and exit.

Commands:
  make   Build this project and install into the environment.
  start  Starts the web server.
```

Running `scryer start` from the virtual environment will kick off the
application locally on your machine.

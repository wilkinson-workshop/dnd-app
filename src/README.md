# Scryer: Developer Guide #
This project is relatively small, in spite of this however there are
some guidelines and patterns to follow for the sake of common
understanding between contributors.

We use these guidelines also to stabilize specific parts of our API
to make it easier on the individual developer as well.

## The REST API ##
Our REST API is the core functionality of Scryer, and as such, the
majority of the code related to REST is implemented [here](scryer/app.py).
The `FastAPI` implementation itself is named `app` per the convention
found in their documentation.

```python3
app = FastAPI()
```

This is created as a singleton basically, and hopefully in future
development will be the *only* singleton in the **Scryer** code base.

Because we need to allow dynamic reloading of the server-- via
`uvicorn`, the ASGI server-- we implement any finalizing of the app
before loading in side of the `setup_application()` function. This
function acts as a factory and is called by `uvicorn` every time the
server needs to be reloaded.

```python3
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
```

See in the definition shown above the usages of different constants.
These are defined below our application's declaration and are likewise
defined in lower portions of this documentation.

### Middleware ###
Middleware is loaded and managed using `fastapi`, but we need to
define them before setup occurs, and will find their definitons in
`APP_MIDDLEWARES`.

```python3
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
```

A middleware configuration in our context consists of 3 parts. The
middleware `class`, the positional `args` and the `keyword` arguments
wrapped within a tuple. These args and kwargs are specific to each
class and will vary. Make sure to read the documentation of each
middleware before applying to this collection.

### Routes ###
Different parts of our API have been broken out into sections to ease
up on maintenance. Whenever we define new endpoints those endpoints
will point to a router defined in the `APP_ROUTERS` constant.

```python3
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
```

To add a new route/method to a router from this mapping, the wrapper
per the appropriate method should be accessible directly from
`APP_ROUTERS`.

```python3
@APP_ROUTERS["root"].get("all/the/things")
def things_list():
    "List all the things"
    ...
```

## Services ##

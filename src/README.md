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

### Mounts ###
Mounts allow us to attach separate applications to **Scryer**. The
main example being where we can extend Scryer to serve pages to a
user via `static files`.

The declaration for additional mounts can be done as in the example. A
tuple pairing of an endpoint and the application itself.

```python3
ASGI_APP_MOUNTS = (
    ("/static", StaticFiles(directory=EXECUTION_ROOT / "static", html=True)),
)
```

## Services ##
A `Service` object is an abstraction representing some external thing
our application depends on. Typically, a `Service` will be another
application which serves data to ours; however, it can also be an
in-memory or persistent implementation.

Services will be required to return their `status` or availability
in otherwords.

#### Status Types ####
- ACTIVE
- BUSY
- OFFLINE
- ONLINE
- UNAVAILABLE

These *types* are defined as an enum `scryer.services.ServiceStatus`.

### Service Protocol ###
This asks for only one method to be implemented. As stated prior, this
method will return the `status` of the service. Although it is
available publicly, it likely more useful to implement its children
defined in `scryer.services`.

#### Services Interface ####
```python3
class Service(typing.Protocol):
    """
    An external data source, task or subprocess
    """

    @property
    @abc.abstractmethod
    def status(self) -> ServiceStatus:
        """The current status of the service."""
```

#### Broker Interfaces ####
A broker encapsulates some data source and moves a resource of a
specified type between `Python` and the data origin.

```python3
class Broker[K, R](Service):
    """
    Manages, or maintains, some resource.
    Typically used for brokering in-memory
    objects.
    """
    ...
```

The `ShelfBroker` is a partial implementation of a `Broker` service
where the external source is a persistent layer written to disk. Note,
this broker only works to its potential if the `shelve` built-in
module is available on your system. In the event your system does not
support `shelve`, data is intead brokered in-memory.

```python3
class ShelfBroker[R](Broker[str, R]):
    """
    A partial implementation of a broker which
    utilizes the `shelve` module to store
    resources persistently.
    """
    ...
```

#### Session Interface ####

This service type represents the basic actions we want to expect from
sockets connected to a single session. This interface is probably the
most unstable and is subject to change.

```python3
class Session[C](Service):
    """
    Active session that manages connections and
    action requests available to users.
    """
    ...
```

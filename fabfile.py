import os

from fabric import Connection


class Config:
    hostname              = os.getenv("REMOTE_HOSTNAME")
    username              = os.getenv("REMOTE_USERNAME")
    application_path      = os.getenv("APPLICATION_PATH", "~")
    service_name_frontend = os.getenv("SERVICE_NAME_FRONTEND", "")
    service_name_backend  = os.getenv("SERVICE_NAME_BACKEND", "")


def systemctl_run_userlevel(conn: Connection, name: str, command: str):
    conn.run(f"systemctl --user {command} {name}")


def deploy():
    with Connection(Config.hostname, Config.username) as c:
        with c.cd(Config.application_path):
            c.run("git pull")
            systemctl_run_userlevel(c, Config.service_name_backend, "restart")
            systemctl_run_userlevel(c, Config.service_name_frontend, "restart")

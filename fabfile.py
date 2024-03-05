import os

from fabric import Connection, task

class Config:
    hostname              = os.getenv("REMOTE_HOSTNAME")
    username              = os.getenv("REMOTE_USERNAME")
    application_path      = os.getenv("APPLICATION_PATH", "~")


def systemctl_run_userlevel(conn: Connection, name: str, command: str):
    conn.run(f"systemctl --user {command} {name}")


@task
def deploy(_):
    with Connection(Config.hostname, Config.username) as c:
        with c.cd(Config.application_path):
            c.run("git pull")
            systemctl_run_userlevel(c, "scryer-test.service", "restart")
            systemctl_run_userlevel(c, "scryer-client-test.service", "restart")

from gen.python import OpenCode


def run():
    client = OpenCode()
    client.tui.publish()
    # body={
    #     "properties": {
    #         "message": "Hello from Hey API OpenAPI TS Playground!",
    #         "variant": "success",
    #     },
    #     "type": "tui.toast.show",
    # },
    # directory="main",

run()

def greet(name: str = "World", times: int = 1) -> None:
    for i in range(times):
        print("Hello, " + name)

def dangerous_func():
    pass

try:
    dangerous_func()
except ValueError as e:
    print(e)

def dangerous_func():
    pass

try:
    dangerous_func()
except Exception:
    pass
finally:
    pass

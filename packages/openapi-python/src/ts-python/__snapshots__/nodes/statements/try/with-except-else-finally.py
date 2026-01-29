def dangerous_func():
    pass

try:
    dangerous_func()
except Exception as e:
    print(e)
else:
    pass
finally:
    pass

def my_decorator(func):
    return func

def another_decorator(func):
    return func

@my_decorator
@another_decorator
class MyClass:
    pass

async def foo():
    items = [1, 2, 3]
    evens = [x async for x in items if x % 2 == 0]

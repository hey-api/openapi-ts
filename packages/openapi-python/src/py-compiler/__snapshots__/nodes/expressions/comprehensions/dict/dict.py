async def foo():
    items = {"key1": "value1", "key2": "value2"}
    {k: v async for (k, v) in items.items() if k % 2}

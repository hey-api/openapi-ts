class context_manager:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        return False

async def foo():
    async with context_manager():
        pass

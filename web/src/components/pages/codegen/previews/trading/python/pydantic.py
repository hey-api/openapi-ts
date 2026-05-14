from pydantic import BaseModel, AwareDatetime
from typing import Literal
from uuid import UUID

class Order(BaseModel):
    id: UUID
    symbol: str
    side: Literal['buy', 'sell']
    type: Literal['market', 'limit', 'stop', 'stop_limit']
    quantity: float
    price: float | None = None
    status: Literal['pending', 'open', 'filled', 'partially_filled', 'cancelled', 'rejected']
    createdAt: AwareDatetime

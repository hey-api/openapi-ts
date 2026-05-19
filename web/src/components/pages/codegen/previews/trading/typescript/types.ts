export type Order = {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  status: 'pending' | 'open' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';
  createdAt: string;
};

export type CreateOrderData = {
  body: Order;
};

export type CreateOrderResponse = Order;

import { createOrder, zOrder } from './trading-client';

const { data, error } = await createOrder({
  body: {
    symbol: 'AAPL',
    side: 'buy',
    type: 'limit',
    quantity: 10,
    price: 189.5,
  },
});

if (error) {
  console.error('Order rejected:', error.message);
  return;
}

const order = zOrder.parse(data);
console.log(`Order ${order.id} is ${order.status}`);

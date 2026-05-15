import { createOrder } from './sdk.gen';

const { data, error } = await createOrder({
  symbol: 'AAPL',
  side: 'buy',
  type: 'limit',
  quantity: 10,
  price: 189.5,
});

if (error) {
  console.error('Order failed:', error.message);
  return;
}

console.log('Order placed:', data.id);

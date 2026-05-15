import { useMutation } from '@tanstack/react-query';
import { createOrderMutation } from './react-query.gen';

const { mutate, data, isPending } = useMutation({
  ...createOrderMutation(),
});

mutate({
  body: {
    symbol: 'AAPL',
    side: 'buy',
    type: 'limit',
    quantity: 10,
    price: 189.5,
  },
});

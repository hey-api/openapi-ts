import { useRef, useState } from 'react';

import {
  getStockHistory,
  watchSelectedStocks,
  watchSingleStock,
  watchStockPrices,
} from './client/sdk.gen';
import type { StockUpdate } from './client/types.gen';

function App() {
  const [updates, setUpdates] = useState<Array<StockUpdate>>([]);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const controllerRef = useRef<AbortController | null>(null);

  // Basic stream consumption using for-await-of
  const onWatchAll = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('connected');
    setUpdates([]);

    try {
      const { stream } = await watchStockPrices({
        signal: controller.signal,
      });

      for await (const update of stream) {
        setUpdates((prev) => [...prev, update]);
      }
    } catch {
      if (!controller.signal.aborted) {
        setStatus('error');
        return;
      }
    }
    setStatus('disconnected');
  };

  // POST-based SSE with request body and callbacks
  const onWatchSelected = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('connected');
    setUpdates([]);

    try {
      const { stream } = await watchSelectedStocks({
        body: {
          symbols: ['AAPL', 'GOOG', 'MSFT'],
        },
        // callback invoked on network or parsing errors
        onSseError: (error) => {
          console.error('SSE error:', error);
        },
        // low-level callback for each raw SSE event.
        // for typed data, use the stream's for-await-of loop below instead.
        onSseEvent: (event) => {
          console.log('SSE event:', event.data, event.event, event.id);
        },
        signal: controller.signal,
        // retry configuration
        sseDefaultRetryDelay: 3000,
        sseMaxRetryAttempts: 5,
        sseMaxRetryDelay: 30000,
      });

      for await (const update of stream) {
        setUpdates((prev) => [...prev, update]);
      }
    } catch {
      if (!controller.signal.aborted) {
        setStatus('error');
        return;
      }
    }
    setStatus('disconnected');
  };

  // SSE with path parameter, query parameter, and error response
  const onWatchSingle = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('connected');
    setUpdates([]);

    try {
      const { stream } = await watchSingleStock({
        path: { symbol: 'AAPL' },
        query: { interval: 2 },
        signal: controller.signal,
      });

      for await (const update of stream) {
        setUpdates((prev) => [...prev, update]);
      }
    } catch {
      if (!controller.signal.aborted) {
        setStatus('error');
        return;
      }
    }
    setStatus('disconnected');
  };

  // Cancel the stream using AbortController
  const onDisconnect = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus('disconnected');
  };

  // Regular (non-SSE) endpoint for comparison
  const onLoadHistory = async () => {
    const { data, error } = await getStockHistory({
      query: { limit: 10 },
    });
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      setUpdates(data);
    }
  };

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        margin: '2rem auto',
        maxWidth: 600,
      }}
    >
      <h1>Hey API + SSE Example</h1>
      <p>
        Status: <strong>{status}</strong>
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button disabled={status === 'connected'} onClick={onWatchAll}>
          Watch All (GET)
        </button>
        <button disabled={status === 'connected'} onClick={onWatchSelected}>
          Watch Selected (POST)
        </button>
        <button disabled={status === 'connected'} onClick={onWatchSingle}>
          Watch AAPL (Path Param)
        </button>
        <button disabled={status !== 'connected'} onClick={onDisconnect}>
          Disconnect
        </button>
        <button disabled={status === 'connected'} onClick={onLoadHistory}>
          Load History
        </button>
      </div>
      <h2>Updates ({updates.length})</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {updates.map((update, i) => (
          <li key={i} style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>
            <strong>[{update.type}]</strong>{' '}
            {update.type === 'price_change' && `${update.symbol} $${update.price}`}
            {update.type === 'trade_executed' &&
              `${update.symbol} ${update.quantity}x @ $${update.price}`}
            {update.type === 'market_alert' && `[${update.severity}] ${update.message}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

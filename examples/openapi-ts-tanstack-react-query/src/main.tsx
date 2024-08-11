import '@radix-ui/themes/styles.css';

import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { client } from './client/services.gen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
    },
  },
});

// configure internal service client
client.setConfig({
  // set default base url for requests
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  // set default headers for requests
  headers: {
    Authorization: 'Bearer <token_from_service_client>',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Theme appearance="dark">
        <App />
      </Theme>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);

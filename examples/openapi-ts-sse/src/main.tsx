import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { client } from './client/client.gen';

client.setConfig({
  baseUrl: 'http://localhost:3000',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

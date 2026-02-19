import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';
import Shell from './Shell';
import { ChainProvider } from './fragments/connectors/ChainProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChainProvider>
      <Shell />
    </ChainProvider>
  </React.StrictMode>
);

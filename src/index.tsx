import React from 'react';
import ReactDOM from 'react-dom';
import loadPolyfills from '@anansi/polyfill';
import { CacheProvider } from 'rest-hooks';
import { createBrowserHistory } from 'history';

import ErrorBoundary from 'components/ErrorBoundary';

import App from './App';

const history = createBrowserHistory();

window.fetchSlow = true;
//window.fetchSlow = false;

async function init() {
  await loadPolyfills();
  const rootElement = document.body;
  const layer = (
    <ErrorBoundary>
      <CacheProvider>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://unpkg.com/tailwindcss@1.1.3/dist/tailwind.min.css"
        />
        <App />
      </CacheProvider>
    </ErrorBoundary>
  );
  ReactDOM.createRoot(rootElement).render(layer);
  // ReactDOM.createBlockingRoot(rootElement).render(layer);
  //ReactDOM.render(layer, rootElement);
}
init();

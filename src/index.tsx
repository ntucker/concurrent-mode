import React from 'react';
import ReactDOM from 'react-dom';
import loadPolyfills from '@anansi/polyfill';
import { CacheProvider } from 'rest-hooks';
import { createBrowserHistory } from 'history';

import ErrorBoundary from 'components/ErrorBoundary';

import 'style/main.scss';
import App from './App';

const history = createBrowserHistory();

window.fetchSlow = true;

async function init() {
  await loadPolyfills();
  ReactDOM.createRoot(document.body).render(
    <ErrorBoundary>
      <CacheProvider>
        <App />
      </CacheProvider>
    </ErrorBoundary>,
  );
}
init();

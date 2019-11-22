import React, { lazy, memo, Suspense } from 'react';
import { RouteChildrenProps } from 'react-router';

import ErrorBoundary from 'components/ErrorBoundary';

function lazyPage(pageName: string) {
  const Page = lazy(() =>
    import(/* webpackChunkName: '[request]' */ `pages/${pageName}`),
  );
  return memo((props: RouteChildrenProps) => (
    <Suspense
      fallback={
        <div className="center">
          loading...
        </div>
      }
    >
      <ErrorBoundary>
        <Page {...props} />
      </ErrorBoundary>
    </Suspense>
  ));
}
export default (lazyPage);

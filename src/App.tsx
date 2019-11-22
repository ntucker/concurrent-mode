import React, { Suspense } from 'react';

import { Loader } from 'components/Loader';
import Home from 'pages/Home';

const App = () => (
  <div>
    <header>hi</header>
    <main>
      <Suspense fallback={<Loader />}>
        <Home />
      </Suspense>
    </main>
  </div>
);

export default React.memo(App);

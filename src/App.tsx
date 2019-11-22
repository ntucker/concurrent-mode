import React, { Suspense, useCallback, useTransition, useState } from 'react';
import { useFetcher } from 'rest-hooks';

import { PostResource, UserResource } from './resources';
import { Core } from 'pages/Others';
import { DataContext } from './route';
import 'style/main.scss';

const SUSPENSE_CONFIG = {
  // When changing user, how long should React wait before
  // falling back to skeleton loaders provided in <Suspense> boundaries?
  timeoutMs: 1500,
};

function useFriendPreloader() {
  const fetchUser = useFetcher(UserResource.detailShape());
  const fetchPosts = useFetcher(PostResource.listShape());
  // ideally we could also fetch the comments for each post at this point
  // however, the API has no solution to this, so we have to have one cascade
  // waterfall here.

  // Alternative API designs include nesting, HTTP/2 server push, and an endpoint
  // to fetch comments based on a user rather than post.

  return useCallback(
    (friendId: number) => {
      fetchUser({ id: friendId });
      fetchPosts({ id: friendId });
    },
    [fetchUser, fetchPosts],
  );
}

function App() {
  const [friendId, setFriendId] = useState(1);
  const [startTransition, isPending] = useTransition(SUSPENSE_CONFIG);
  const preload = useFriendPreloader();

  const changeFriend = useCallback(
    friendId => {
      // This becomes more meaningful when you start code splitting and load
      // load with suspense as well. Then you don't have to wait on the code
      // loading to start the data fetch.
      preload(friendId);
      // This delays commiting the React tree with new friendId until
      // suspense is resolved.
      startTransition(() => {
        setFriendId(friendId);
      });
    },
    [preload, startTransition],
  );

  const context = {
    friendId: friendId,
    changeFriend: changeFriend,
    isPending,
  };

  return (
    <DataContext.Provider value={context}>
      <Suspense fallback={null}>
        {/* Null fallback means less intermediate loading spinners */}
        <Core />
      </Suspense>
    </DataContext.Provider>
  );
}

export default React.memo(App);

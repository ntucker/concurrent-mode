import React from 'react';
import { useResource } from 'rest-hooks';
import { PostResource } from 'resources';

export default function Main() {
  const posts = useResource(PostResource.listShape(), {});
  return <div>{posts.length}</div>;
}

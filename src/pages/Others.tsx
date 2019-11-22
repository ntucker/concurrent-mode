import React, { Suspense, SuspenseList } from 'react';
import { useResource } from 'rest-hooks';
import classnames from 'classnames';
import { chunk } from 'lodash';

import { PostResource, CommentResource, UserResource } from 'resources';
import { Spinner } from 'components/Spinner';
import { Loader } from 'components/Loader';
import { useData } from 'route';

function loadImage(url: string) {
  fetch(url);
}

// ----------------------------

export function Core() {
  // LOOK: Change the SuspenseList revealOrder to backwards.
  // Notice how the top right option resolves later.

  // It's still unclear to me how SuspenseList works with nested Suspenses.
  // What is considered "ready"?
  // Why does it throw an error if you only provide one component?

  // Notice how I've nested the Suspense blocks. This lets me control the
  // order of revealing to a user:
  // 1) Header bar (but user name in top right can come later)
  //    "Loading" spinner for rest of page
  // 2) Sidebar (complete with all dynamically loaded friends)
  //    Skeleton user card, skeleton posts
  // 3) Friend page (FriendCard)
  //    Maybe show skeleton Posts
  // 4) Posts (I'll explain further about them lower down)

  // It doesn't matter what order the data comes in from the network,
  // The page will always load top down, in a predictable controlled manner
  return (
    <div>
      <SuspenseList revealOrder="forwards">
        <Header />
        <div className="mb-8" />
        <Suspense fallback={<FriendLoader />}>
          <div className="flex container mx-auto justify-between">
            <div className="w-64">
              <Sidebar />
            </div>
            <div className="w-full ml-8">
              <Content />
            </div>
          </div>
          <div className="mb-16" />
          <Footer />
        </Suspense>
      </SuspenseList>
    </div>
  );
}

const Header = () => {
  // Header uses the Img component - this lets us suspend until
  // the logo we want to display has fully loaded. It won't pop in later.
  return (
    <div className="bg-gray-800 text-gray-300 w-full flex justify-between items-center py-3 px-12 shadow-xl">
      <img
        src="https://png2.cleanpng.com/sh/7d3b22513d541c5c0b484098a902dd9d/L0KzQYm3VsA1N5p0iZH0aYP2gLBuTgJmaZR5RdxqdnH2c8PwkQQuaZ9sjd5qcnr2Pbr2jvlkNZJ5h982NXK0RYXphcY6PGg5Tak3M0S6QYq7UcgyPWM9SaQ7M0S1RoGBUb5xdpg=/kisspng-react-javascript-angularjs-ionic-atom-5b154be6947457.3471941815281223426081.png"
        alt="React Logo"
        style={{ height: '32px', width: '32px' }}
      />
      <FriendId />
      <HeaderMenu />
    </div>
  );
};

const FriendId = () => {
  // We're grabbing possible data from the data context.
  const { friendId, changeFriend, isPending } = useData();
  // Simply calling useData will not suspend
  // It's not until we try reading a resource (shown lower)
  // that we suspend.

  return (
    <div className="w-64 flex">
      <input
        value={friendId}
        onChange={e => {
          const newId = Number(e.target.value);
          changeFriend(newId);
        }}
        type="number"
        className="rounded p-2 w-16 text-center bg-gray-700 shadow-inner"
      />
      {/* isPending is taken from the startTransition.
       * We can use this to show that we're in a transition, or that
       * concurrent mode has started rendering new content but it's
       * suspended and we don't want to show a Suspense fallback
       * *just yet*,
       */}
      {isPending && (
        <div className="fadeIn flex items-center ml-4">
          <div className="-mt-1">
            <Spinner />
          </div>
          <div>&nbsp;Loading friend...</div>
        </div>
      )}
    </div>
  );
};

const HeaderMenu = () => {
  // By adding a Suspense boundary in here, we can show the whole Header
  // immediately to give form to the page, aiding user visual understanding.
  return (
    <div className="w-64 text-right">
      <Suspense fallback={<div>Loading menu...</div>}>
        <HeaderMenuInner />
      </Suspense>
    </div>
  );
};

const HeaderMenuInner = () => {
  const { friendId } = useData();
  // Since we useResource, there's a chance we might suspend.
  const user = useResource(UserResource.detailShape(), { id: friendId });

  // This is named "HeaderMenu" but for simplicity it's just a name.
  return <div>{user.name}</div>;
};

const Sidebar = () => {
  // Same here - useResource means we might suspend.
  // Above us, Sidebar is deliberately NOT wrapped in a Suspense boundary.
  // This means we can load in all the friends data dynamically, but
  // never have the Sidebar pop in shape or show a spinner.
  // This is obviously a choice to wait for a bit more information before
  // displaying more of the page outline.
  const friends = useResource(UserResource.listShape(), {});

  return (
    <div className="w-full rounded p-2">
      <div>
        <div>
          <strong>Main</strong>
        </div>
        <div>Home</div>
        <div>About</div>
        <hr />
        <div>
          <strong>Friends</strong>
        </div>
        {friends.map(friend => (
          <SidebarFriend key={friend.id} friend={friend} />
        ))}
      </div>
      <hr />
      <div>
        <div>
          <strong>Events</strong>
        </div>
        <div>Create new</div>
        <div>View current</div>
      </div>
    </div>
  );
};

const SidebarFriend = ({ friend }: { friend: UserResource }) => {
  const { friendId, changeFriend } = useData();
  const selected = friend.id === friendId;

  return (
    <div key={friend.id}>
      <button
        className={classnames('text-blue-600 hover:text-blue-400', {
          'font-semibold': selected,
        })}
        onClick={() => {
          changeFriend(friend.id);
        }}
        onMouseOver={() => {
          // LOOK:
          // Ask for data before the user has even clicked.
          // May be quite network resource-intensive.
          // Also requires you to know the data dependency
          // of whereever you're navigating to.
          //
          // Uncomment for preloading of friend:
          // makeDataResource(user.id).preload();
        }}
      >
        <div className="flex items-center">
          <img
            src={`https://i.pravatar.cc/256?img=${friend.id + 4}`}
            className={classnames(
              'w-5 h-5 rounded-full -mb-1 border-2 shadow',
              selected ? 'border-blue-700' : 'border-white',
            )}
          />
          <div className="ml-1">{friend.name.slice(0, 16)}</div>
        </div>
      </button>
    </div>
  );
};

const Content = () => {
  // Here we actually have two nested Suspense boundaries
  // and the outer one provides a fallback that looks like the inner
  // fallback. I had to manually include <PostsSkeleton /> twice.
  // Maybe a better pattern for nested Suspeense fallbacks will emerge.

  // By nesting the posts Suspense boundary inside the friend card one,
  // we can show friend information and draw the user's attention earlier.
  return (
    <main className="w-full">
      <Suspense
        fallback={
          <div>
            <FriendCardSkeleton />
            <div className="mb-4" />
            <PostsSkeleton />
          </div>
        }
      >
        <FriendCard />
        <div className="mb-4" />
        <Suspense fallback={<PostsSkeleton />}>
          <Posts />
        </Suspense>
      </Suspense>
    </main>
  );
};

const FriendCard = () => {
  const { friendId } = useData();
  const friend = useResource(UserResource.detailShape(), { id: friendId });

  const coverImage = `http://placekitten.com/800/200?image=${friend.id}`;
  const coverImageFallback = `http://placekitten.com/80/20?image=${friend.id}`;

  const profileImage = `https://i.pravatar.cc/256?img=${friend.id + 4}`;

  // As we're using the images as CSS background-image URLS, we can't
  // use the <Img /> component. Instead we'll use its internal to get the
  // same effect - to not render UserCard until the image fallback is ready.
  // This lets us load a small image really quickly, and progressively
  // upgrade when ready.
  loadImage(coverImageFallback);

  // However, let's not provide a lower quality fallback for the profile picture.
  // People are naturally drawn to look at these images - it should be high quality
  // immediately.
  loadImage(profileImage);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg">
        <div
          className="bg-local bg-cover flex rounded-t-lg h-32"
          style={{
            backgroundImage: `url('${coverImage}'), url('${coverImageFallback}')`,
          }}
        />
        <div className="-mt-12 ml-4 flex items-center flex-row-reverse justify-end">
          <div className="bg-white -ml-6 pl-8 pr-4 rounded-r-full pt-2">
            <h1 className="font-thin text-2xl">{friend.name}</h1>
            <div className="text-gray-600">{friend.email}</div>
          </div>
          <div
            className="rounded-full border-white border-4 bg-white shadow bg-cover"
            style={{
              backgroundImage: `url('${profileImage}')`,
              width: '92px',
              height: '92px',
            }}
          />
        </div>
        <div className="flex justify-around py-4 fadeIn">
          <div className="text-blue-700">{friend.website}</div>
          <div>{friend.company.catchPhrase}</div>
          <PostCount />
        </div>
      </div>
    </>
  );
};

const FriendCardSkeleton = () => {
  // This should be as close to FriendCard as possible, but far simplified
  // to let the user know "Hey, we're still loading, and we're not ignoring you!"
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="bg-local bg-gray-200 bg-cover flex rounded-t-lg h-32" />
      <div className="-mt-12 ml-4 flex items-center flex-row-reverse justify-end">
        <div className="bg-white -ml-6 pl-8 pr-4 rounded-r-full pt-2">
          <h1 className="font-thin text-2xl">&nbsp;</h1>
          <div className="text-gray-600 w-32">&nbsp;</div>
        </div>
        <div
          className="rounded-full border-white border-4 bg-white shadow bg-cover flex justify-center items-center -mt-1"
          style={{
            width: '96px',
            height: '96px',
          }}
        >
          <Spinner />
        </div>
      </div>
      <div className="flex justify-around py-4">
        <div>&nbsp;</div>
      </div>
    </div>
  );
};

const PostCount = () => {
  // We want the friend card to show how many posts a friend has written.
  // But we can't know that until we've got the network data back for the friend's
  // posts.
  // It's more important that we can see the whole FriendCard though,
  // so we provide a null Suspense boundary. It can appear later as it needs.
  // This is an example of coordinating data to display in disparate locations
  // without having to wait for each other to load fully.
  return (
    <div style={{ minWidth: '160px' }}>
      <Suspense fallback={null}>
        <PostCountInner />
      </Suspense>
    </div>
  );
};

const PostCountInner = () => {
  const { friendId } = useData();
  const posts = useResource(PostResource.listShape(), { userId: friendId });

  return <span className="fadeIn">Has written {posts.length} posts</span>;
};

const Posts = () => {
  const { friendId } = useData();
  const posts = useResource(PostResource.listShape(), { userId: friendId });

  // By using a SuspenseList here, we can guarantee that posts
  // appear in the optimal viewing order, despite separately loading comments.
  // Using "forwards" and "collapsed", we always see earlier loaded posts before later,
  // but never later loaded posts before earlier. This avoids the page "popping"
  // as it resizes with the comment section.
  // Suspsense lets us "unlock" the title and body of the first post, but avoid
  // showing other posts or having to wait for all the comments to load to display.

  // I've also chunked posts to appear two at a time inside a Suspense boundary.
  // This is mostly to explore the possibilities of Suspense - displaying data
  // exactly on our terms, rather than merely when the network returns.

  // LOOK: Uncomment / recomment the Suspense boundaries in Posts and Post to
  // see how boundaries at different layers can affect users.
  // Remove the SuspenseList and see how much jankier it looks!

  const chunkedPosts = chunk(posts, 2);

  return (
    <>
      <div className="flex flex-wrap -mx-4">
        <SuspenseList revealOrder="forwards" tail="collapsed">
          {chunkedPosts.map(([post1, post2]: any) => (
            <React.Fragment key={post1.id}>
              {post1 && (
                <div key={post1.id} className="w-1/2">
                  <Post post={post1} />
                </div>
              )}
              {post2 && (
                <div key={post2.id} className="w-1/2">
                  <Post post={post2} />
                </div>
              )}
            </React.Fragment>
          ))}
        </SuspenseList>
      </div>
    </>
  );
};

const PostsSkeleton = () => {
  const Post = () => {
    return (
      <div className="p-4">
        <div className="mb-6 shadow-lg rounded-lg">
          <div className="bg-white p-6 rounded-lg h-64 flex content-center justify-center items-center">
            <div>
              <Spinner />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap -mx-4">
      <div className="w-1/2">
        <Post />
      </div>
      <div className="w-1/2">
        <Post />
      </div>
    </div>
  );
};

const Post = ({ post }: { post: PostResource }) => {
  // Nothing fancy here.
  return (
    <div className="p-4 fadeIn">
      <div className="mb-6 shadow-lg rounded-lg">
        <div className="bg-white p-6 rounded-t-lg">
          <h2 className="font-bold text-xl capitalize">{post.title}</h2>
          <p>
            {post.body}
            <small>{post.date}</small>
          </p>
        </div>
        <Comments post={post} />
      </div>
    </div>
  );
};

const Comments = ({ post }: { post: PostResource }) => {
  // This is a pattern I've used a lot during this example, that
  // I'd like to see a better solution to.
  // I have both a coordinating wrapper component to provide a Suspense
  // boundary, and the inner "actual" component to read a resource.
  return (
    <>
      <div>
        <Suspense fallback={<CommentsSkeleton />}>
          <div className="fadeIn">
            <CommentsInner postId={post.id} />
          </div>
        </Suspense>
      </div>
    </>
  );
};

const CommentsInner = ({ postId }: { postId: number | undefined }) => {
  const comments = useResource(CommentResource.listShape(), { postId });

  // There are no Suspense boundaries in here. This is important, as
  // we'll see in Comment.

  return (
    <>
      <div className="bg-gray-100 text-gray-600 p-1 text-xs border-t">
        <span className="ml-8">{comments.length} REPLIES</span>
      </div>
      <div className="bg-gray-200 px-6 py-4 rounded-b-lg text-gray-700">
        {comments.map(comment => (
          <Comment comment={comment} key={comment.id} />
        ))}
        <div className="italic text-blue-400 mt-2">Show more</div>
      </div>
    </>
  );
};

const Comment = ({ comment }: { comment: CommentResource }) => {
  // We want to use Img to ensure we've loaded the profile picture
  // of the commenter before displaying the comment.
  // Since there's no Suspense boundary in CommentsInner, we know that
  // all the comments will display, complete with images, at the same time.
  // No popping profile pictures!

  const profileImage = `https://i.pravatar.cc/32?img=${(comment.id + 15) % 70}`;
  // The +15 %70 is just to guarantee unique images from our placeholder - don't worry about it.

  return (
    <div className="mb-4">
      <div className="flex">
        <img
          src={profileImage}
          className="rounded-lg border-white border-2 mr-3 mt-1"
          style={{ width: '32px', height: '32px' }}
        />
        <div className="flex flex-col">
          <div>
            <strong>{comment.email}</strong>:
          </div>
          <div className="italic">{comment.name}.</div>
        </div>
      </div>
    </div>
  );
};

const CommentsSkeleton = () => {
  return (
    <>
      <div className="bg-gray-200 px-6 py-4 rounded-b-lg text-gray-700">
        <Spinner /> Loading comments...
      </div>
    </>
  );
};

const Footer = () => {
  return (
    <div className="w-full flex justify-between py-3 px-8 border shadow">
      <div>This is the footer</div>
    </div>
  );
};

const FriendLoader = () => {
  return (
    <Suspense fallback={<Loader text="Loading friend..." />}>
      <FriendLoaderInner />
    </Suspense>
  );
};

const FriendLoaderInner = () => {
  const { friendId } = useData();
  const friend = useResource(UserResource.detailShape(), { id: friendId });

  // const profileImage = `https://i.pravatar.cc/256?img=${friend.id + 4}`;
  // preloadImage(profileImage);

  return <Loader text={`Loading ${friend.name}...`} />;
};

import { createContext, useContext } from 'react';

// If using a library that sorts your data for you, like Apollo, Redux etc
// you'd likely be able to get data straight from the context.
// This avoids having to drill props all the way through your component stack.
export const DataContext = createContext({
  friendId: 0,
  changeFriend: (id: number) => {},
  isPending: false,
});
export const useData = () => useContext(DataContext);

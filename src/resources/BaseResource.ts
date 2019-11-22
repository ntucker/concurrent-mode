import { Method, Resource } from 'rest-hooks';

export function promiseTimeout(time: number) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(time);
    }, time);
  });
}

const extraTimeout = 0;
export const slowFetch = async (url: string, timeout = extraTimeout) => {
  const response = await fetch(url);
  const data = await response.json();
  await promiseTimeout(timeout + Math.random() * 1000);
  return data;
};

export default abstract class BaseResource extends Resource {
  static fetch<T extends typeof Resource>(
    this: T,
    method: Method,
    url: string,
    body?: Readonly<object | string>,
  ): Promise<any> {
    if (method === 'get' && window.fetchSlow) {
      return slowFetch(url);
    }
    return super.fetch(method, url, body);
  }
}

import { merge } from 'lodash'
import { unflatten } from 'flat'

export function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function deepMerge(target: any, source: any): any {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export function flattenAndMerge(first: any, second: any): any {
  return merge(unflatten(first), unflatten(second));
}

export const extractYouTubeId = (input: string | undefined) => {
  if (!input) return null;

  // If it's already just an 11-char video ID (typical format)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);

    // Handle normal watch URLs: ?v=VIDEOID
    if (url.searchParams.has('v')) {
      return url.searchParams.get('v');
    }

    // Handle share URLs: youtu.be/VIDEOID
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1);
    }

    // Handle embed URLs: youtube.com/embed/VIDEOID
    const pathMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Handle shorts URLs: youtube.com/shorts/VIDEOID
    const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) {
      return shortsMatch[1];
    }
  } catch {}

  return null;
}
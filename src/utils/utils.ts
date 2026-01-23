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
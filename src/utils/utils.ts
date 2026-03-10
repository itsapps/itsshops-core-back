import { createPublishedId } from '@sanity/id-utils'
import { uuid } from '@sanity/uuid'
import { unflatten } from 'flat'
import { merge } from 'lodash'

export function isObject(item: unknown): boolean {
  if (!item) return false
  return typeof item === 'object' && !Array.isArray(item)
}

export function deepMerge<T extends object, S extends object>(target: T, source: S): T & S {
  // We initialize the output. Use 'any' internally during the construction
  // if necessary, but the function signature remains strictly typed.
  const output = { ...target } as any

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = (source as any)[key]
      const targetValue = (target as any)[key]

      if (isObject(sourceValue)) {
        if (key in target) {
          output[key] = deepMerge(targetValue, sourceValue)
        } else {
          output[key] = sourceValue
        }
      } else {
        output[key] = sourceValue
      }
    })
  }

  return output as T & S
}

export function flattenAndMerge(first: any, second: any): any {
  return merge(unflatten(first), unflatten(second))
}

export const extractYouTubeId = (input: string | undefined): string | null => {
  if (!input) return null

  // If it's already just an 11-char video ID (typical format)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input
  }

  try {
    const url = new URL(input)

    // Handle normal watch URLs: ?v=VIDEOID
    if (url.searchParams.has('v')) {
      return url.searchParams.get('v')
    }

    // Handle share URLs: youtu.be/VIDEOID
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1)
    }

    // Handle embed URLs: youtube.com/embed/VIDEOID
    const pathMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
    if (pathMatch) {
      return pathMatch[1]
    }

    // Handle shorts URLs: youtube.com/shorts/VIDEOID
    const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/)
    if (shortsMatch) {
      return shortsMatch[1]
    }
  } catch {
    /* empty */
  }

  return null
}

export function isDefined<T>(argument: T | undefined | null | false): argument is T {
  return argument !== undefined && argument !== null && argument !== false
}

/** Generate a random short ID */
export function uid(): string {
  return Math.random().toString(36).slice(2)
}

export function docUid(type: string): string {
  return createPublishedId(`${type}-${uuid()}`)
}

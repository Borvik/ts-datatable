import { ReactNode } from 'react';

export type ReactRenderable = ReactNode | null
export type SyncFn<T> = () => T;
export type AsyncFn<T> = () => Promise<T>;
export type Fn<T> = SyncFn<T> | AsyncFn<T>;
export type TypeOrFn<T> = SyncFn<T> | T;


/**
 * Converts the types of the keys on an interface
 * into the type it is, or a function that
 * returns the type it is
 */
export type ResolveProps<T> = {
  [P in keyof T]: TypeOrFn<T[P]>
};

export function resolve<T>(fn?: TypeOrFn<T>, defaultValue?: T): T {
  if (typeof fn === 'undefined') {
    if (typeof defaultValue === 'undefined')
      throw new Error(`Unable to resolve value - no value passed, and no default specified`);
    return defaultValue;
  }

  if (isSyncFn(fn))
    return fn();
  return fn;
}

function isSyncFn<T>(fn: TypeOrFn<T>): fn is SyncFn<T> {
  return (typeof fn === 'function');
}
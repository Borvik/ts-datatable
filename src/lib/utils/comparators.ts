import { isEqual } from './isEqual';

export type ComparatorFn = (a: any[], b: any[]) => boolean;

export function deepCompare(a: any[], b: any[]): boolean {
  return isEqual(a, b);
}

export function simpleCompare(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  return b.every((x, i) => a[i] === x);
}

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && typeof value !== 'undefined';
}
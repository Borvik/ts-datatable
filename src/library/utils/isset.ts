export function isset<T>(value: T | null | undefined): value is T {
  if (typeof value === 'undefined' || value === null)
    return false;
  return true;
}
export function isEmpty(value: any): boolean {
  if (typeof value === 'undefined' || value === null)
    return true;

  if (typeof value === 'string' && value.trim() === '')
    return true;

  if (typeof value === 'number' && Number.isNaN(value))
    return true;

  return false;
}
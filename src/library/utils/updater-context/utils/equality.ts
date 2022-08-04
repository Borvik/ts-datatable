function isValidDate(date: unknown): date is Date {
  return !!date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date as number);
}

function simpleEqualityCheck(a: unknown, b: unknown): boolean {
  if (a === null && b === null) return true;
  else if (a === null || b === null) return false;
  else if (typeof a === 'undefined' && typeof b === 'undefined') return true;
  else if (typeof a === 'undefined' || typeof b === 'undefined') return false;
  else if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((value, index) => b[index] === value);
  }
  else if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }
  else if (isValidDate(a) && isValidDate(b)) {
    return a.toISOString() === b.toISOString();
  }
  else if (isValidDate(a) || isValidDate(b)) {
    return false;
  }
  else if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a!);
    const bKeys = Object.keys(b!);
    if (aKeys.length !== bKeys.length) return false;

    const sameKeys = aKeys.every(value => bKeys.includes(value));
    if (!sameKeys) return false;

    // @ts-ignore
    return aKeys.every(value => a[value] === b[value]);
  }
  else if (typeof a === 'object' || typeof b === 'object') {
    return false;
  }
  return a === b;
}

export type EqualityCheckFn = typeof simpleEqualityCheck;
export { simpleEqualityCheck };
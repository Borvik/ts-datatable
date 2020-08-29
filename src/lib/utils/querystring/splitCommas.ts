/**
 * Splits a string on commas that are _not_ within parentheses.
 * 
 * This is to help with properly parsing nested qs object arrays
 * 
 * Example: 'a,b,c,(d,e,f)'
 * Result: ['a', 'b', 'c', '(d,e,f)']
 * 
 * @param value Value string to split on commas
 */
export function splitCommas(value: string, splitOn: string = ','): string[] {
  let results: string[] = [];
  if (!value) return results;
  
  let lastCommaIndex: number = -1,
      currPos: number = 0,
      openParen: number = 0;

  while (currPos <= value.length) {
    let char = value.charAt(currPos);

    if (char === '(') { openParen++ }
    else if (char === ')') { openParen-- }
    else if (char === splitOn && !openParen) {
      // found a comma not in parentheses
      if (lastCommaIndex + 1 === currPos) { // should cover pos:0
        results.push('');
      }
      else {
        // get from last comma - should handle beginning of string fine
        results.push(value.substring(lastCommaIndex + 1, currPos))
      }

      lastCommaIndex = currPos;
    }

    currPos++;
  }

  if (lastCommaIndex <= value.length - 1) {
    results.push(value.substring(lastCommaIndex + 1));
  }
  return results;
}
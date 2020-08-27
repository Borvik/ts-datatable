/**
 * Splits a string on object key/value pairs
 * 
 * This is to help with properly parsing nested qs object arrays
 * 
 * Example: (other:5;or:(id:1;op:nul),(name:asdf))
 * Result: ['other:5', 'or:(id:1;op:nul),(name:asdf)']
 * 
 * @param value Value string to split on commas
 */
export function splitObject(value: string): string[] {
  let results: string[] = [];
  if (!value) return results;
  
  let lastCommaIndex: number = -1,
      currPos: number = 0,
      openParen: number = 0;

  while (currPos <= value.length) {
    let char = value.charAt(currPos);

    if (char === '(') { openParen++ }
    else if (char === ')') { openParen-- }
    else if (char === ',' && !openParen) {
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
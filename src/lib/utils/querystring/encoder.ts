const ENCODE_REGEX = new RegExp('[^A-z0-9]', 'g');
const DECODE_REGEX = new RegExp('[+]', 'g');

function encoder(match: string): string {
  if (match === ' ') return '+';
  return encodeURIComponent(match);
}

export function encode(value: string): string {
  if (!value) return '';
  let encodedString = value.replace(ENCODE_REGEX, encoder);
  // encode needs a little more help with parentheses, decode doesn't need this
  return encodedString.replace('(', '%28').replace(')', '%29');
}

// should run AFTER deserialization on results
export function decode(value: string): string {
  if (!value) return '';
  return decodeURIComponent(value.replace(DECODE_REGEX, ' '));
}
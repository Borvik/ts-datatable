import { encode, decode } from "./encoder";
import { splitCommas } from "./splitCommas";

export class QueryString {

  static stringify(obj: any): string {
    let seenObjects: any[] = [];

    function doStringify(obj: any, nested: boolean): string {
      const typ = typeof obj;

      if (obj && typ === 'object') {
        if (seenObjects.includes(obj))
          return '';
        seenObjects.push(obj);
      }

      if (Array.isArray(obj)) {
        let arrResult = obj.filter(isset)
          .map((a: any) => doStringify(a, true))
          .join(',');
        return arrResult;
      }
      else if (typ === 'object') {
        let keys = Object.keys(obj);

        // filter out null/undefined keys
        keys = keys.filter(k => isset(obj[k]));

        // nested determins HOW to output the object,
        // top level, standard qs format key=value&key2=value2
        // nested, (key:value,key2:value2)
        let keyValueSep = '=',
            keySep = '&',
            prefix = '',
            suffix = '';

        if (nested) {
          keyValueSep = ':';
          keySep = ';';
          prefix = '(';
          suffix = ')';
        }
        let keyValues = keys.map(key => `${encode(key)}${keyValueSep}${doStringify(obj[key], true)}`);
        return `${prefix}${keyValues.join(keySep)}${suffix}`;
      }
      else if (!isset(typ) || typ === 'function' || typ === 'symbol') {
        return '';
      }
      else if (typ === 'boolean') {
        return obj ? '1' : '0';
      }
      else if (typ === 'number') {
        if (Number.isNaN(obj)) return '';
        return encode(obj.toString());
      }
      else {
        // scalar value - toString to convert numbers to strings for encode
        return encode(obj.toString());
      }
    }
    
    return doStringify(obj, false);
  }

  static parse(qs: string): any {
    qs = (qs ?? '').trim();
    if (!qs || qs === '?') return {};
    if (qs[0] === '?') qs = qs.substr(1);

    let result: any = {};
    
    function parseValue(value: string): any {
      // value like: (a:b;c:d),(e:f,g:h)
      let valueArray = splitCommas(value);
      let parsedValues = valueArray.map(val => {
        if (val.length < 4) {
          return decode(val);
        }
        
        if (val[0] === '(' && val.substr(-1, 1) === ')') {
          // Object format - (a:b;c:d) - could be (a:b),(c:d)
          let objValue: any = {};
          let trimmed = val.substring(1, val.length - 1);
          let allObjectKeys = splitCommas(trimmed, ';');
          for (let objKeyValue of allObjectKeys) {
            // should be like - a:b
            let [objK, objV] = splitCommas(objKeyValue, ':');
            if (typeof objV === 'undefined') {
              objValue[decode(objK)] = '';
              continue;
            }
            objValue[decode(objK)] = parseValue(objV);
          }
          return objValue;
        }

        return decode(val);
      });

      if (valueArray.length < 1) return '';
      return (valueArray.length === 1) 
        ? parsedValues[0]
        : parsedValues;
    }

    // first split on & for top level keys
    let allKeyValues = qs.split('&');

    for (let keyValue of allKeyValues) {
      // should be like: key=(a:b;c:d),(e:f,g:h)
      let [key, value] = keyValue.split('=');

      if (typeof value === 'undefined') {
        result[decode(key)] = '';
        continue;
      }
      result[decode(key)] = parseValue(value);
    }

    return result;
  }
}

function isset<T>(obj: T): obj is T {
  return (typeof obj !== 'undefined' && obj !== null);
}

if (typeof window !== 'undefined') {
  (window as any).qs_stringify = QueryString.stringify;
  (window as any).qs_parse = QueryString.parse;
}
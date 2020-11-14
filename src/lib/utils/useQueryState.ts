import { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import cloneDeep from 'lodash/cloneDeep';
import cleanDeep from 'clean-deep';
import get from 'lodash/get';
import set from 'lodash/set';
import { isEqual } from './isEqual';
import { useDeepDerivedState } from './useDerivedState';
import { QueryString } from './querystring';
import { isset } from './isset';

const VALID_TYPES: string[] = ["any", "string", "number", "bigint", "boolean", "string[]", "number[]", "bigint[]", "boolean[]"];
type typeofResult = "any" | "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
type typeofWithArrays = typeofResult | "string[]" | "number[]" | "bigint[]" | "boolean[]";
type validQSTypes = "any" | "string" | "number" | "bigint" | "boolean" | "string[]" | "number[]" | "bigint[]" | "boolean[]";
export type QueryStringFilterTypes = "any" | "string" | "number" | "bigint" | "boolean";

function isValidQSType(value: string): value is validQSTypes {
  return VALID_TYPES.includes(value);
}

interface PropertyTypes {
  [x: string]: validQSTypes;
}

function convertToNumber(value: any): number | undefined {
  if (typeof value === 'undefined' || value === null)
    return undefined;

  if (typeof value !== 'string')
    throw new Error(`Unable to convert value to number`);

  // Special case to allow reading "empty" value from qs
  if (value === '') return Number.NaN;

  if (isNaN(Number(value)))
    throw new Error(`QS value "${value}" cannot be represented as a 'number'.`);
  return Number(value);
}

function convertToBigInt(value: any): BigInt | undefined {
  if (!value) return undefined;
  if (typeof value !== 'string')
    throw new Error(`Unable to convert value to bigint`);

  if (!value.match(/^\d+$/))
    throw new Error(`QS value "${value}" cannot be represented as a 'bigint'.`);
  return BigInt(value);
}

function convertToBoolean(value: any): boolean | undefined {
  if (!value) return undefined;
  if (typeof value !== 'string')
    throw new Error(`Unable to convert value to boolean`);

  if (['1', 'true', 't'].includes(value.toLocaleLowerCase()))
    return true;
  if (['0', 'false', 'f'].includes(value.toLocaleLowerCase()))
    return false;
  throw new Error(`QS value "${value}" cannot be represented as a 'boolean'.`);
}

export function convertQsValue(value: any, toType: typeofWithArrays) {
  if (!VALID_TYPES.includes(toType))
    throw new Error(`Unable to convert string value to '${toType}'`);

  if (typeof value === 'undefined') return undefined;
  if (value === null) return undefined;

  if (typeof value === toType || toType === 'any')
    return value;

  if (toType === 'bigint') {
    return convertToBigInt(value);
  }

  if (toType === 'bigint[]') {
    if (!value) return undefined;

    if (Array.isArray(value))
      return value.map(convertToBigInt).filter(isset);

    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to number array`);
    let valueArr = value.split(',');
    return valueArr.map(convertToBigInt).filter(isset);
  }

  if (toType === 'number') {
    return convertToNumber(value);
  }

  if (toType === 'number[]') {
    if (!value) return undefined;

    if (Array.isArray(value))
      return value.map(convertToNumber).filter(isset);

    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to number array`);
    let valueArr = value.split(',');
    return valueArr.map(convertToNumber).filter(isset);
  }

  if (toType === 'boolean') {
    return convertToBoolean(value);
  }

  if (toType === 'boolean[]') {
    if (!value) return undefined;

    if (Array.isArray(value))
      return value.map(convertToBoolean).filter(isset);

    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to boolean array`);
    let valueArr = value.split(',');
    return valueArr.map(convertToBoolean).filter(isset);
  }

  if (toType === 'string[]') {
    if (typeof value === 'undefined' || value === null)
      return undefined;
    if (Array.isArray(value))
      return value;
    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to string array`);
    return value.split(',');
  }

  return value;
}

function getQueryStringState<State>(queryString: string, initialState: State, options?: QueryStateOptions): State {
  let qsObject = QueryString.parse(queryString);

  let newState = cloneDeep(initialState);
  let stateKeys = Object.keys(initialState);
  let dataTypes = options?.properties;

  if (!dataTypes) {
    dataTypes = {};
    for (let key of stateKeys) {
      let initialType = typeof initialState[key as keyof State];
      // with change to QS encoding (no external library), is this still the case?
      if (isValidQSType(initialType)) {
        dataTypes[key] = initialType;
      } else {
        throw new Error(`Complex type ${initialType} unable to serialize to query string`);
      }
    }
  }

  stateKeys = Object.keys(dataTypes);
  for (let key of stateKeys) {
    let qsKey = options?.prefix ? `${options.prefix}.${key}` : key;
    let qsValue = get(qsObject, qsKey, undefined);

    if (typeof qsValue !== 'undefined') {
      let newValue = convertQsValue(qsValue, dataTypes[key]);
      if (typeof newValue !== 'undefined')
        set(newState as any, key, newValue);
    }
  }
  return newState;
}

function getQueryString<State>(origQueryString: string, newState: State, initialState: State, prefix?: string): string {
  let qsObject = QueryString.parse(origQueryString);

  let stateKeys = Object.keys(initialState);
  let newStateKeys = Object.keys(newState);
  // set values from clonedState to qsObject
  for (let key of newStateKeys) {
    if (stateKeys.includes(key)) continue;
    let qsKey = prefix ? `${prefix}.${key}` : key;
    set(qsObject, qsKey, newState[key as keyof State]);
  }

  // check if any value from initialState equals newValue, if so remove it
  for (let key of stateKeys) {
    let qsKey = prefix ? `${prefix}.${key}` : key;
    if (isEqual(newState[key as keyof State], initialState[key as keyof State])) {
      set(qsObject, qsKey, null);
    } else {
      set(qsObject, qsKey, newState[key as keyof State]);
    }
  }

  // clean it from empty values - don't need them in object
  qsObject = cleanDeep(qsObject, { emptyStrings: false });

  // create the new query string
  let newQs = QueryString.stringify(qsObject);

  return newQs;
}

/*
{page: 1, perPage: 10}
{column1: 'data', column2: 'search', column3: 4, column4: [4,5,6]}
Some properties are optional, some required - required ones should have a default.
If no properties specified - assume all are required and in default value
All properties should have an optional prefix
table1: {
  pages: {
    page: 1,
    perPage: 10
  },
  filters: {
    column1: 'data',
    //...
  }
}

options: {
  prefix?: string, // prefix for the container to this set of values
  properties?: {
    [x: string]
  }
}
*/

export interface QueryStateOptions {
  prefix?: string; // prefix for the container to this set of values
  internalState?: boolean; // store in qs or not (doesn't allow portability, but could be nicer for multiple on same page)
  properties?: PropertyTypes;
}

export function useQueryState<State>(initialState: State, options?: QueryStateOptions): [State, (newState: Partial<State> | ((state: State) => Partial<State>)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, search: string}>({init: false});
  const location = useLocation();
  const history = useHistory();

  let currPublicState: State;
  if (!localState.init || (!options?.internalState && location.search !== localState.search)) {
    let potentialPublicState = options?.internalState
      ? initialState
      : getQueryStringState(location.search, initialState, options);

    if (!localState.init || !isEqual(localState.publicState, potentialPublicState)) {
      currPublicState = potentialPublicState;
    } else {
      currPublicState = localState.publicState;
    }
    
    setLocalState({
      init: true,
      publicState: currPublicState,
      search: location.search,
    });
  } else {
    currPublicState = localState.publicState;
  }

  // derive state so reference can be the same
  let [derivedInitialState] = useDeepDerivedState(() => { return initialState; }, [initialState]);
  
  const publicSetState = (newState: (Partial<State> | ((state: State) => Partial<State>))) => {
    setLocalState(localState => {
      if (!localState.init) throw new Error('Set Query State called before it was initialized');

      /**
       * get FULL qs, and update it
       */
      const mergeState = typeof newState === 'function'
        ? (newState as any)(localState.publicState)
        : newState;

      const publicState = { ...localState.publicState, ...mergeState };

      if (BATCHING_UPDATES && !options?.internalState) {
        performBatchedUpdate(history, location, publicState, derivedInitialState, options?.prefix);
        return localState;
      }

      let newQS = getQueryString(location.search, publicState, derivedInitialState, options?.prefix);
      if (!options?.internalState) {
        setImmediate(() => {
          history.push({
            ...location,
            search: newQS
          });
        });
      }

      return { init: true, publicState, search: newQS };
    });
  };

  return [currPublicState, publicSetState];
}

type HistoryType = ReturnType<typeof useHistory>;
type HistoryCreateRefProps = Parameters<HistoryType['createHref']>;
type LocationDescriptorObject = HistoryCreateRefProps[0];

let BATCHING_UPDATES: boolean = false;
let batchedHistoryObj: HistoryType | null;
let batchUpdateLoc: LocationDescriptorObject | null;

function performBatchedUpdate(history: HistoryType, location: LocationDescriptorObject, newState: any, initialState: any, optionPrefix?: string): void {
  if (!batchUpdateLoc) {
    batchUpdateLoc = location;
    batchedHistoryObj = history;
  }

  let newQS = getQueryString(batchUpdateLoc.search ?? '', newState, initialState, optionPrefix);
  batchUpdateLoc.search = newQS;
}

export function batchedQSUpdate(fn: Function) {
  BATCHING_UPDATES = true;

  fn();
  
  BATCHING_UPDATES = false;

  if (batchedHistoryObj) {
    batchedHistoryObj.push(batchUpdateLoc!);
  }

  batchUpdateLoc = null;
  batchedHistoryObj = null;
}

export type {
  PropertyTypes as QueryStringPropTypes
}
import { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import cloneDeep from 'lodash/cloneDeep';
import cleanDeep from 'clean-deep';
import get from 'lodash/get';
import set from 'lodash/set';
import { isEqual } from './isEqual';
import qs from 'qs';
import { useDeepDerivedState } from './useDerivedState';

const VALID_TYPES: string[] = ["string", "number", "bigint", "boolean", "string[]", "number[]", "bigint[]", "boolean[]"];
type typeofResult = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
type typeofWithArrays = typeofResult | "string[]" | "number[]" | "bigint[]" | "boolean[]";
type validQSTypes = "string" | "number" | "bigint" | "boolean" | "string[]" | "number[]" | "bigint[]" | "boolean[]";

function isValidQSType(value: string): value is validQSTypes {
  return VALID_TYPES.includes(value);
}

interface PropertyTypes {
  [x: string]: validQSTypes;
}

function convertQsValue(value: any, toType: typeofWithArrays) {
  if (!VALID_TYPES.includes(toType))
    throw new Error(`Unable to convert string value to '${toType}'`);

  if (typeof value === 'undefined') return undefined;
  if (value === null) return undefined;

  if (typeof value === toType)
    return value;

  if (toType === 'bigint') {
    if (!value) return undefined;
    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to bigint`);

    if (!value.match(/^\d+$/))
      throw new Error(`QS value "${value}" cannot be represented as a 'bigint'.`);
    return BigInt(value);
  }

  if (toType === 'bigint[]') {
    if (!value) return undefined;
    throw new Error('Not Yet Implemented');
  }

  if (toType === 'number') {
    if (!value) return undefined;
    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to number`);

    if (isNaN(Number(value)))
      throw new Error(`QS value "${value}" cannot be represented as a 'number'.`);
    return Number(value);
  }

  if (toType === 'number[]') {
    if (!value) return undefined;
    throw new Error('Not Yet Implemented');
  }

  if (toType === 'boolean') {
    if (!value) return undefined;
    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to boolean`);

    if (['1', 'true', 't'].includes(value.toLocaleLowerCase()))
      return true;
    if (['0', 'false', 'f'].includes(value.toLocaleLowerCase()))
      return false;
    throw new Error(`QS value "${value}" cannot be represented as a 'boolean'.`);
  }

  if (toType === 'boolean[]') {
    if (!value) return undefined;
    throw new Error('Not Yet Implemented');
  }

  if (toType === 'string[]') {
    if (!value) return undefined;
    if (typeof value !== 'string')
      throw new Error(`Unable to convert value to string array`);
    return value.split(',');
  }

  return value;
}

function getQueryStringState<State>(queryString: string, initialState: State, options?: QueryStateOptions): State {
  let qsObject = qs.parse(queryString, {
    ignoreQueryPrefix: true,
    comma: true,
    allowDots: true,
  });

  let newState = cloneDeep(initialState);
  let stateKeys = Object.keys(initialState);
  let dataTypes = options?.properties;

  if (!dataTypes) {
    dataTypes = {};
    for (let key of stateKeys) {
      let initialType = typeof initialState[key as keyof State];
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
  let qsObject = qs.parse(origQueryString, {
    ignoreQueryPrefix: true,
    comma: true,
    allowDots: true,
  });

  // set values from clonedState to qsObject
  // check if any value from initialState equals newValue, if so remove it

  let stateKeys = Object.keys(initialState);
  for (let key of stateKeys) {
    let qsKey = prefix ? `${prefix}.${key}` : key;
    if (isEqual(newState[key as keyof State], initialState[key as keyof State])) {
      set(qsObject, qsKey, null);
    } else {
      set(qsObject, qsKey, newState[key as keyof State]);
    }
  }

  // clean it from empty values - don't need them in object
  qsObject = cleanDeep(qsObject);

  // create the new query string
  let newQs = qs.stringify(qsObject, {
    arrayFormat: 'comma',
    allowDots: true,
  });

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
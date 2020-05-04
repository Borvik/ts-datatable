import { useState, useCallback, useEffect } from 'react';
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
    throw new Error('Not Yet Implemented');
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
        (newState as any)[key] = newValue;
    }
  }
  return newState;
}

function getQueryString<State>(origQueryString: string, newState: State, initialState: State, prefix?: string): string {
  let qsObject = qs.parse(origQueryString, {
    ignoreQueryPrefix: true,
  });

  // set values from clonedState to qsObject
  // check if any value from initialState equals newValue, if so remove it

  let stateKeys = Object.keys(initialState);
  for (let key of stateKeys) {
    let qsKey = prefix ? `${prefix}.${key}` : key;
    if (newState[key as keyof State] === initialState[key as keyof State]) {
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
{page: 1, limit: 10}
{column1: 'data', column2: 'search', column3: 4, column4: [4,5,6]}
Some properties are optional, some required - required ones should have a default.
If no properties specified - assume all are required and in default value
All properties should have an optional prefix
table1: {
  pages: {
    page: 1,
    limit: 10
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

interface QueryStateOptions {
  prefix?: string; // prefix for the container to this set of values
  internalState?: boolean; // store in qs or not (doesn't allow portability, but could be nicer for multiple on same page)
  properties?: PropertyTypes;
}

export function useQueryState<State>(initialState: State, options?: QueryStateOptions): [State, (newState: State | ((state: State) => State)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, search: string}>({init: false});
  const location = useLocation();
  const history = useHistory();

  // useEffect(() => {
  //   // const unlisten = history.listen((location, action) => {
  //   //   setLocalState(v => {
  //   //     if (!v.init) return v;

  //   //     // Search will change causing next if to reset and properly get new state
  //   //     return {
  //   //       init: true,
  //   //       publicState: v.publicState,
  //   //       search: location.search
  //   //     }
  //   //   });
  //   // });

  //   setTimeout(() => { console.log('Change History'); history.push('?page=2'); }, 5000);
  //   // return function cleanup() { unlisten(); }
  // }, [ history ]);
  
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

  let optionPrefix = options?.prefix;
  let optionInternalState = options?.internalState;
  // derive state so reference can be the same
  let [derivedInitialState] = useDeepDerivedState(() => { return initialState; }, [initialState]);
  
  const publicSetState = useCallback(
    (newState: (State | ((state: State) => State))) => {
      setLocalState(localState => {
        if (!localState.init) throw new Error();

        // saveLocalState(key, localState);
        /**
         * get FULL qs, and update it
         */
        const publicState = typeof newState === 'function'
          ? (newState as any)(localState.publicState)
          : newState;

        if (!optionInternalState) {
          let newQS = getQueryString(location.search, publicState, derivedInitialState, optionPrefix);
          history.push({
            ...location,
            search: newQS
          });
        }

        return {...localState, publicState};
      });
    },
    [ location, history, optionPrefix, optionInternalState, derivedInitialState ]
  );
  return [currPublicState, publicSetState];
}
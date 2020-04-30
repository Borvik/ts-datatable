import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import { isEqual } from './isEqual';
import qs from 'qs';

const VALID_TYPES: string[] = ["string", "number", "bigint", "boolean", "string[]", "number[]", "bigint[]", "boolean[]"];
type typeofResult = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
type typeofWithArrays = typeofResult | "string[]" | "number[]" | "bigint[]" | "boolean[]";

interface StateTypes {
  [x: string]: typeofWithArrays;
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

function getQueryStringState<State>(queryString: string, initialState: State, dataTypes?: StateTypes): State {
  let qsObject = qs.parse(queryString, {
    ignoreQueryPrefix: true
  });

  let newState = cloneDeep(initialState);
  let stateKeys = Object.keys(initialState);

  if (!dataTypes) {
    dataTypes = {};
    for (let key of stateKeys) {
      dataTypes[key] = typeof initialState[key as keyof State];
    }
  }

  for (let key of stateKeys) {
    if (typeof qsObject[key] !== 'undefined') {
      let newValue = convertQsValue(qsObject[key] as string, dataTypes[key]);
      if (typeof newValue !== 'undefined')
        (newState as any)[key as keyof State] = newValue;
    }
  }
  return newState;
}

function setQueryString<State>(location: ReturnType<typeof useLocation>, newState: State, initialState: State): string {
  let qsObject = qs.parse(location.search, {
    ignoreQueryPrefix: true
  });

  return '';
}

export function useQueryState<State>(initialState: State, dataTypes?: StateTypes): [State, (newState: State | ((state: State) => State)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, search: string}>({init: false});
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // const unlisten = history.listen((location, action) => {
    //   setLocalState(v => {
    //     if (!v.init) return v;

    //     // Search will change causing next if to reset and properly get new state
    //     return {
    //       init: true,
    //       publicState: v.publicState,
    //       search: location.search
    //     }
    //   });
    // });

    setTimeout(() => { console.log('Change History'); history.push('?page=2'); }, 5000);
    // return function cleanup() { unlisten(); }
  }, [ history ]);
  
  let currPublicState: State;
  if (!localState.init || location.search !== localState.search) {
    let potentialPublicState = getQueryStringState(location.search, initialState, dataTypes);

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

  const publicSetState = useCallback(
    (newState: (State | ((state: State) => State))) => {
      // setLocalState(localState => {
      //   if (!localState.init) throw new Error();
      //   // saveLocalState(key, localState);
      //   /**
      //    * get FULL qs, and update it
      //    */
      //   const publicState = typeof newState === 'function'
      //     ? (newState as any)(localState.publicState)
      //     : newState;
      //   return {...localState, publicState};
      // });
    },
    []
  );
  return [currPublicState, publicSetState];
}
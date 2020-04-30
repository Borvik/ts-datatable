import { useState, useCallback, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import qs from 'qs';

const VALID_TYPES: string[] = ["string", "number", "bigint", "boolean"];
type typeofResult = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";

function convertQsValue(value: string, toType: typeofResult) {
  if (!VALID_TYPES.includes(toType))
    throw new Error(`Unable to convert string value to '${toType}'`);

  if (typeof value === 'undefined') return undefined;
  if (value === null) return undefined;

  if (typeof value === toType)
    return value;

  if (toType === 'bigint') {
    if (!value) return undefined;
    if (!value.match(/^\d+$/))
      throw new Error(`QS value "${value}" cannot be represented as a 'bigint'.`);
    return BigInt(value);
  }

  if (toType === 'number') {
    if (!value) return undefined;
    if (isNaN(Number(value)))
      throw new Error(`QS value "${value}" cannot be represented as a 'number'.`);
    return Number(value);
  }

  if (toType === 'boolean') {
    if (!value) return undefined;
    if (['1', 'true', 't'].includes(value.toLocaleLowerCase()))
      return true;
    if (['0', 'false', 'f'].includes(value.toLocaleLowerCase()))
      return false;
    throw new Error(`QS value "${value}" cannot be represented as a 'boolean'.`);
  }

  return value;
}

function getQueryStringState<State>(queryString: string, initialState: State): State {
  let qsObject = qs.parse(queryString, {
    ignoreQueryPrefix: true
  });

  let newState = cloneDeep(initialState);
  let stateKeys = Object.keys(initialState);
  for (let key of stateKeys) {
    if (typeof qsObject[key] !== 'undefined') {
      let newValue = convertQsValue(qsObject[key] as string, typeof (initialState as any)[key]);
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

export function useQueryState<State>(initialState: State): [State, (newState: State | ((state: State) => State)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, search: string}>({init: false});
  const location = useLocation();
  // const history = useHistory();

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

  //   setTimeout(() => { console.log('Change History'); history.push('?page=3'); }, 5000);
  //   // return function cleanup() { unlisten(); }
  // }, [ history ]);
  
  let currPublicState: State;
  if (!localState.init || location.search !== localState.search) {
    console.log('Calculating History State', localState.init, (localState as any).search, location.search);
    currPublicState = getQueryStringState(location.search, initialState);

    /**
     * Use keys on initial state to determine keys to store in qs
     * when key = initial value, removed from qs
     * if value not in qs, use initial
     */

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
      setLocalState(localState => {
        if (!localState.init) throw new Error();
        // saveLocalState(key, localState);
        /**
         * get FULL qs, and update it
         */
        const publicState = typeof newState === 'function'
          ? (newState as any)(localState.publicState)
          : newState;
        return {...localState, publicState};
      });
    },
    []
  );
  return [currPublicState, publicSetState];
}
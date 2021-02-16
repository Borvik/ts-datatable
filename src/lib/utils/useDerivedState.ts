// Adapted from: https://hackernoon.com/whats-the-right-way-to-fetch-data-in-react-hooks-a-deep-dive-2jc13230

import { useState, useCallback, useDebugValue, useRef } from 'react';
import { deepCompare, simpleCompare, arrayCompare, ComparatorFn } from './comparators';

export function useDeepDerivedState<State>(onDepChange: (prevState: State | null) => State, depList: any[]): [State, (newState: State | ((state: State) => State)) => void] {
  let value = useCommonDerivedState(onDepChange, depList, deepCompare);
  useDebugValue(value[0]);
  return value;
}

export function useDerivedState<State>(onDepChange: (prevState: State | null) => State, depList: any[]): [State, (newState: State | ((state: State) => State)) => void] {
  let value = useCommonDerivedState(onDepChange, depList, simpleCompare);
  useDebugValue(value[0]);
  return value;
}

export function useArrayDerivedState<State>(onDepChange: (prevState: State | null) => State, depList: any[][]): [State, (newState: State | ((state: State) => State)) => void] {
  let value = useCommonDerivedState(onDepChange, depList, arrayCompare);
  useDebugValue(value[0]);
  return value;
}

type LocalState<State> = {init: false} | {init: true, publicState: State, depList: any[]};
function useCommonDerivedState<State>(onDepChange: (prevState: State | null) => State, depList: any[], comparator: ComparatorFn): [State, (newState: State | ((state: State) => State)) => void] {
  const [,setRerender] = useState(1);
  const localRef = useRef<LocalState<State>>({init: false});

  let currPublicState: State;
  if (!localRef.current.init || !comparator(depList, localRef.current.depList)) {
    currPublicState = onDepChange(!localRef.current.init ? null : localRef.current.publicState);
    localRef.current = {
      init: true,
      publicState: currPublicState,
      depList
    };
  } else {
    currPublicState = localRef.current.publicState;
  }

  const publicSetState = useCallback(
    (newState: (State | ((state: State) => State))) => {
      if (!localRef.current.init) throw new Error();
      const publicState = typeof newState === 'function'
        ? (newState as any)(localRef.current.publicState) as State
        : newState;
      localRef.current = { ...localRef.current, publicState };
      setRerender(v => 0 - v); // toggle's between 1 and -1
    },
    [ localRef ]
  );
  return [currPublicState, publicSetState];
}
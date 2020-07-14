// Adapted from: https://hackernoon.com/whats-the-right-way-to-fetch-data-in-react-hooks-a-deep-dive-2jc13230

import { useState, useCallback, useDebugValue } from 'react';
import { deepCompare, simpleCompare, ComparatorFn } from './comparators';

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

function useCommonDerivedState<State>(onDepChange: (prevState: State | null) => State, depList: any[], comparator: ComparatorFn): [State, (newState: State | ((state: State) => State)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, depList: any[]}>({init: false});

  let currPublicState: State;
  if (!localState.init || !comparator(depList, localState.depList)) {
    currPublicState = onDepChange(!localState.init ? null : localState.publicState);
    setLocalState({
      init: true,
      publicState: currPublicState,
      depList
    });
  } else {
    currPublicState = localState.publicState;
  }

  const publicSetState = useCallback(
    (newState: (State | ((state: State) => State))) => {
      setLocalState(localState => {
        if (!localState.init) throw new Error();
        const publicState = typeof newState === 'function'
          ? (newState as any)(localState.publicState) as State
          : newState;
        return {...localState, publicState};
      });
    },
    []
  );
  return [currPublicState, publicSetState];
}
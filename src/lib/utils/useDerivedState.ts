// Adapted from: https://hackernoon.com/whats-the-right-way-to-fetch-data-in-react-hooks-a-deep-dive-2jc13230

import { useState, useCallback } from 'react';
import { deepCompare, simpleCompare, ComparatorFn } from './comparators';

export function useDeepDerivedState<State>(onDepChange: () => State, depList: any[]): [State, (newState: State | ((state: State) => State)) => void] {
  return useCommonDerivedState(onDepChange, depList, deepCompare);
}

export function useDerivedState<State>(onDepChange: () => State, depList: any[]): [State, (newState: State | ((state: State) => State)) => void] {
  return useCommonDerivedState(onDepChange, depList, simpleCompare);
}

function useCommonDerivedState<State>(onDepChange: () => State, depList: any[], comparator: ComparatorFn): [State, (newState: State | ((state: State) => State)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, depList: any[]}>({init: false});

  let currPublicState: State;
  if (!localState.init || !comparator(depList, localState.depList)) {
    currPublicState = onDepChange();
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
          ? (newState as any)(localState.publicState)
          : newState;
        return {...localState, publicState};
      });
    },
    []
  );
  return [currPublicState, publicSetState];
}
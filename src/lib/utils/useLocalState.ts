import { useState, useCallback } from 'react';
import { getLocalState, saveLocalState } from './storage';
import { simpleCompare } from './comparators';

export function useLocalState<State>(key: string, defaultValue: State, depList: any[]): [State, (newState: State | ((state: State) => State)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, depList: any[]}>({init: false});
  
  let currPublicState: State;
  if (!localState.init || !simpleCompare(depList, localState.depList)) {
    currPublicState = getLocalState(key) ?? defaultValue;
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
        saveLocalState(key, localState);
        const publicState = typeof newState === 'function'
          ? (newState as any)(localState.publicState)
          : newState;
        return {...localState, publicState};
      });
    },
    [key]
  );
  return [currPublicState, publicSetState];
}
import { useState, useCallback, useRef } from 'react';
import { getLocalState, saveLocalState } from './storage';
import { simpleCompare } from './comparators';

type LocalState<State> = {init: false} | {init: true, publicState: State, depList: any[]};

export function useLocalState<State>(key: string, defaultValue: State, depList: any[]): [State, (newState: State | ((state: State) => State)) => void] {
  const [,setRerender] = useState(1);
  const localRef = useRef<LocalState<State>>({init: false});
  
  let currPublicState: State;
  if (!localRef.current.init || !simpleCompare(depList, localRef.current.depList)) {
    currPublicState = getLocalState(key) ?? defaultValue;
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
        ? (newState as any)(localRef.current.publicState)
        : newState;
      saveLocalState(key, publicState);
      localRef.current = {...localRef.current, publicState};
      setRerender(v => 0 - v); // toggle's between 1 and -1
    },
    [key, localRef]
  );
  return [currPublicState, publicSetState];
}
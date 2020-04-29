import { useState, useCallback, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

export function useQueryState<State>(initialState: State): [State, (newState: State | ((state: State) => State)) => void] {
  const [localState, setLocalState] = useState<{init: false} | {init: true, publicState: State, search: string}>({init: false});
  const location = useLocation();
  
  // do we need to use a history listener?
  const history = useHistory();
  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      // do something...
    });
    return function cleanup() {
      unlisten();
    }
  }, []);
  
  let currPublicState: State;
  if (!localState.init || location.search !== localState.search) {
    currPublicState = initialState;
    // currPublicState = getLocalState(key) ?? defaultValue;

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
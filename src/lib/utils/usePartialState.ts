import { useState, useCallback } from 'react';

export function usePartialState<State>(initialState: State): [State, (newState: Partial<State> | ((state: State) => Partial<State>)) => void] {
  const [localState, setLocalState] = useState(initialState);

  const publicSetState = useCallback(
    (newState: (Partial<State> | ((state: State) => Partial<State>))) => {
      setLocalState(curState => {
        const mergeState = typeof newState === 'function'
          ? (newState as any)(curState)
          : newState;

        return {...curState, ...mergeState};
      });
    }, []);

  return [localState, publicSetState];
}

export function useFormState<State>(initialState: State): [State, (newState: Partial<State> | ((state: State) => Partial<State>)) => void] {
  const [localState, setLocalState] = useState<Partial<State>>({});

  const publicSetState = useCallback(
    (newState: (Partial<State> | ((state: State) => Partial<State>))) => {
      setLocalState(curState => {
        const mergeState = typeof newState === 'function'
          ? (newState as any)(curState)
          : newState;

        return {...curState, ...mergeState};
      });
    }, []);

  const formState: State = {
    ...initialState,
    ...localState,
  };

  return [formState, publicSetState];
}
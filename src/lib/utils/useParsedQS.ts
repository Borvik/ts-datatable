import { useQueryState, QueryStateOptions } from "./useQueryState";
import { useDeepDerivedState } from "./useDerivedState";
import { useCallback, useDebugValue } from "react";

type ConvertFn<T, V> = (value: T) => V;

export function useParsedQs<State, QSState>(initialState: State, parse: ConvertFn<QSState, State>, encode: ConvertFn<State, QSState>, options?: QueryStateOptions): [State, (newState: State | ((state: State) => State)) => void] {
  const [qsInitialState] = useDeepDerivedState(() => encode(initialState), [ initialState ]);
  const [localState, setLocalState] = useQueryState(qsInitialState, options);
  const [actualState] = useDeepDerivedState(() => parse(localState), [localState]);

  const publicSetState = useCallback(
    (newState: (State | ((state: State) => State))) => {
      setLocalState(ls => {
        let newActualState = typeof newState === 'function'
          ? (newState as any)(actualState)
          : newState;

        let newQsState = encode(newActualState);
        return newQsState;
      });
    },
    [ actualState, encode, setLocalState ]
  );
  useDebugValue(actualState);
  return [actualState, publicSetState];
}
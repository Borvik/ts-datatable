import { useQueryState } from '@borvik/use-querystate';
import { QueryStateOptions, DeepPartial } from '@borvik/use-querystate/dist/types';
import { useDeepDerivedState } from "./useDerivedState";
import { useCallback, useDebugValue } from "react";

type ConvertFn<T, V> = (value: T) => V;

export function useParsedQs<State, QSState extends object>(initialState: State, parse: ConvertFn<DeepPartial<QSState>, State>, encode: ConvertFn<State, DeepPartial<QSState>>, options?: QueryStateOptions): [State, (newState: State | ((state: State) => State)) => void] {
  const [qsInitialState] = useDeepDerivedState(() => encode(initialState), [ initialState ]);
  const [localState, setLocalState] = useQueryState<QSState>(qsInitialState as any, options);
  const [actualState] = useDeepDerivedState(() => parse(localState), [localState]);

  const publicSetState = useCallback(
    (newState: (State | ((state: State) => State))) => {
      setLocalState(() => {
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
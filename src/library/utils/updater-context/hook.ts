import { useCallback, useContext, useDebugValue, useRef, useState } from "react";
import { SelectorCallback, SelectorInternalContext, UpdaterCallback } from "./types";
import { EqualityCheckFn, simpleEqualityCheck } from "./utils/equality";
import { useIsomorphicLayoutEffect } from "./utils/useIsomorphicLayoutEffect";

type RefState<T> = {init: false} | {init: true, value: T};

export function createUseSelector<T>(Context: React.Context<SelectorInternalContext<T> | null>) {
  return function useSelector<R>(cb: SelectorCallback<T, R>, equalityFn: EqualityCheckFn = simpleEqualityCheck): [R, UpdaterCallback<T>] {
    const store = useContext(Context);
    if (!store) {
      throw new Error('Cannot use `useSelector` outside of a Provider');
    }
  
    const [, forceRender] = useState(1);
    const selectorRef = useRef(cb);
    selectorRef.current = cb;
  
    const selStateRef = useRef<RefState<R>>({ init: false });
    if (!selStateRef.current.init) {
      selStateRef.current = { init: true, value: cb(store.getState()) }
    }
  
    const checkForUpdates = useCallback(() => {
      const newState = selectorRef.current(store.getState());
      if (!selStateRef.current.init) {
        selStateRef.current = { init: true, value: newState };
        forceRender(v => 0 - v);
        return;
      }

      const isEqual = equalityFn(selStateRef.current.value, newState);
      if (!isEqual) {
        console.log('missed equal check:', {
          current: selStateRef.current.value,
          setto: newState,
        });
        selStateRef.current = { init: true, value: newState }
        forceRender(v => 0 - v);
      }
    }, [store, equalityFn]);
  
    useIsomorphicLayoutEffect(() => {
      return store.subscribe(checkForUpdates);
    }, [store, checkForUpdates]);

    useDebugValue(selStateRef.current);
    return [selStateRef.current.value, store.getUpdater()];
  }
}
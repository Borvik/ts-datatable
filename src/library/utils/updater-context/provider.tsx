import React, { PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import { ProviderProps, SelectorInternalContext, SubscriberCallback, UnsubscribeCallback, UpdaterCallback } from './types';

export function createProvider<T extends object>(Context: React.Context<SelectorInternalContext<T> | null>, initialState: T) {
  return function Provider({ children, initialValue }: PropsWithChildren<ProviderProps<T>>): JSX.Element {
    const storeRef = useRef<T>({
      ...initialState,
      ...initialValue
    });
    const subscribersRef = useRef<SubscriberCallback[]>([]);
    const updaterRef = useRef<UpdaterCallback<T>>();
  
    updaterRef.current = useCallback(
      (newState: (Partial<T> | ((state: T) => Partial<T>))) => {
        const publicState = typeof newState === 'function'
          ? (newState as any)(storeRef.current) as T
          : newState;

        storeRef.current = {
          ...storeRef.current,
          ...publicState,
        };

        // Notify all subscribers...
        subscribersRef.current.forEach(sub => sub());
      }, [storeRef, subscribersRef]
    );
  
    const contextValue = useMemo(() => ({
      subscribe: (cb: SubscriberCallback): UnsubscribeCallback => {
        subscribersRef.current.push(cb);
        return () => {
          subscribersRef.current = subscribersRef.current.filter(sub => sub !== cb);
        }
      },
      getState: () => storeRef.current,
      getUpdater: () => updaterRef.current!,
    }), []);
  
    return <Context.Provider value={contextValue}>{children}</Context.Provider>
  }
}
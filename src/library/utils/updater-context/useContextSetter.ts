import React, { useContext } from 'react';
import { SelectorInternalContext } from "./types";

export function createContextSetter<T>(Context: React.Context<SelectorInternalContext<T> | null>) {
  return function useContextSetter() {
    const store = useContext(Context);
    if (!store) {
      throw new Error('Cannot use `useUpdater` outside of a Provider');
    }

    return store.getUpdater();
  }
}
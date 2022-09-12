import React from 'react';
import { createConsumer } from './consumer';
import { createHOCFunction } from './hoc';
import { createUseSelector } from './hook';
import { createProvider } from './provider';
import { SelectorContext, SelectorInternalContext } from './types';
import { createContextSetter } from './useContextSetter';

export function createContext<T extends object>(initialState: T): SelectorContext<T> {
  const ReactUpdaterContext = React.createContext<SelectorInternalContext<T> | null>(null);

  if (process.env.NODE_ENV !== 'production') {
    ReactUpdaterContext.displayName = 'ReactUpdaterContext';
  }

  const Provider = createProvider(ReactUpdaterContext, initialState);
  const useSelector = createUseSelector(ReactUpdaterContext);
  const Consumer = createConsumer(useSelector);
  const withSelector = createHOCFunction(Consumer);
  const useContextSetter = createContextSetter(ReactUpdaterContext);

  return {
    Provider,
    Consumer,
    useSelector,
    withSelector,
    useContextSetter,
  };
}
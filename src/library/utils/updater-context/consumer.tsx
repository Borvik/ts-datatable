import React, { PropsWithChildren } from 'react';
import { ConsumerProps, UseSelectorHookDef } from './types';

export function createConsumer<T>(useSelector: UseSelectorHookDef<T>) {
  return function Consumer<R>({ children, selector, equalityFn }: PropsWithChildren<ConsumerProps<T, R>>): React.ReactElement<any, any> | null {
    const [value, updater] = useSelector<R>(selector, equalityFn);
    if (!children) return null;
    return children(value, updater);
  };
}
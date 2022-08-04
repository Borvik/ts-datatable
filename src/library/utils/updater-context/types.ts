import React from "react";

export type UpdaterCallback<T> = (newState: Partial<T> | ((state: T) => Partial<T>)) => void;

export type UnsubscribeCallback = () => void;
export type SubscriberCallback = () => void;
export interface SelectorInternalContext<T = any> {
  subscribe: (cb: SubscriberCallback) => UnsubscribeCallback
  getState: () => T
  getUpdater: () => UpdaterCallback<T>
}


export interface ProviderProps<T> {
  initialValue?: Partial<T>
}
export type ProviderType<T> = React.FC<React.PropsWithChildren<ProviderProps<T>>>;

export type EqualityCheckFn = (a: unknown, b: unknown) => boolean;
export type SelectorCallback<T, R> = (state: T) => R;
export type UseSelectorHookDef<T> = <R>(cb: SelectorCallback<T, R>, equalityFn?: EqualityCheckFn) => [R, UpdaterCallback<T>]

export interface ConsumerProps<T, R = any> {
  selector: SelectorCallback<T, R>
  // TODO: can we get value generically typed to infered R from selector prop? Currently in sel-consumer-context it just comes across as `unknown`
  children: (value: R, updater: UpdaterCallback<T>) => React.ReactElement<any, any> | null
  equalityFn?: EqualityCheckFn
}
export type ConsumerType<T> = <R = any>(props: React.PropsWithChildren<ConsumerProps<T, R>>, context?: any) => React.ReactElement<any, any> | null;

// eslint-disable-next-line @typescript-eslint/ban-types
export type SelectorHOC<T> = <R>(selector: SelectorCallback<T, R>, equalityFn?: EqualityCheckFn | undefined) => <P extends object>(WrappedComponent: React.ComponentType<P>) => React.ComponentClass<P>

export interface SelectorContext<T> {
  Provider: ProviderType<T>
  Consumer: ConsumerType<T>
  useSelector: UseSelectorHookDef<T>
  withSelector: SelectorHOC<T>
}
/* eslint-disable @typescript-eslint/ban-types */
import React, { Component, ComponentClass, ComponentType } from 'react';
import { ConsumerType, EqualityCheckFn, SelectorCallback } from './types';

export function createHOCFunction<T>(Consumer: ConsumerType<T>) {
  return function withSelector<R>(
    selector: SelectorCallback<T, R>,
    equalityFn?: EqualityCheckFn
  ): <P extends object>(WrappedComponent: ComponentType<P>) => ComponentClass<P> {
    return <P extends object>(WrappedComponent: ComponentType<P>) =>
      class SelectorContextComponent extends Component<P> {
        public render() {
          return (
            <Consumer<R> selector={selector} equalityFn={equalityFn}>
              {value => (<WrappedComponent {...this.props} selectorValue={value} />)}
            </Consumer>
          );
        }
      };
  }
}
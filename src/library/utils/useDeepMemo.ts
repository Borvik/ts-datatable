import { useRef } from 'react';
import { deepCompare } from './comparators';

type LocalState<T> = {init: false} | {init: true, value: T, depList: any[]};

export function useDeepMemo<T>(fn: () => T, depList: any[]): T {
  let localRef = useRef<LocalState<T>>({ init: false });

  if (!localRef.current.init || !deepCompare(depList, localRef.current.depList)) {
    localRef.current= {
      init: true,
      value: fn(),
      depList,
    }
  }

  return localRef.current.value;
}
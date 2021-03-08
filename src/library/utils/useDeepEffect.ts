import { useEffect, useRef } from 'react';
import { deepCompare } from './comparators';

type EffectFn = () => void | (() => void);
type LocalState = {init: false, effectDep: boolean} | {init: true, effectDep: boolean, depList: any[]};

export function useDeepEffect(fn: EffectFn, depList: any[]): void {
  let localRef = useRef<LocalState>({ init: false, effectDep: false });

  if (!localRef.current.init || !deepCompare(depList, localRef.current.depList)) {
    localRef.current= {
      init: true,
      effectDep: !localRef.current.effectDep,
      depList,
    }
  }

  useEffect(fn, [localRef.current.effectDep]);
}
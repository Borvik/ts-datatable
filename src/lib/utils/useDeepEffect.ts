import { useState, useEffect } from 'react';
import { deepCompare } from './comparators';

type EffectFn = () => void | (() => void);

export function useDeepEffect(fn: EffectFn, depList: any[]): void {
  const [localState, setLocalState] = useState<{init: false, effectDep: boolean} | {init: true, effectDep: boolean, depList: any[]}>({ init: false, effectDep: false });

  if (!localState.init || !deepCompare(depList, localState.depList)) {
    setLocalState(state => ({
      init: true,
      effectDep: !state.effectDep,
      depList,
    }));
  }

  useEffect(fn, [localState.effectDep]);
}
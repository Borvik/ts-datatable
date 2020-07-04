import { useEffect, MutableRefObject } from 'react';

export const useEventListener = <T extends EventTarget>(target: T | MutableRefObject<T>, type: string, listener: EventListener, ...options: any[]) => {
  useEffect(() => {
    const currentTarget = isRef(target)
      ? target.current
      : target;

    if (currentTarget)
      currentTarget.addEventListener(type, listener, ...options);

    return () => {
      if (currentTarget)
        currentTarget.removeEventListener(type, listener, ...options);
    }
  }, [target, type, listener, options]);
};

function isRef<T>(target: T | MutableRefObject<T>): target is MutableRefObject<T> {
  return Object.prototype.hasOwnProperty.call(target, 'current');
}
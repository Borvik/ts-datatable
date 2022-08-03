import { MutableRefObject, useCallback, useRef, useState } from 'react';

export function useStateRef<State>(defaultValue: State): [MutableRefObject<State>, React.Dispatch<React.SetStateAction<State>>] {
  const [,setRerender] = useState(1);
  const localRef = useRef(defaultValue);
  
  const publisSetState = useCallback(
    (newState: React.SetStateAction<State>) => {
      const publicState = (typeof newState === 'function')
        ? (newState as any)(localRef.current)
        : newState;

      localRef.current = publicState;
      setRerender(v => 0 - v); // toggle's between 1 and -1
    },
    [localRef]
  );

  return [localRef, publisSetState];
}
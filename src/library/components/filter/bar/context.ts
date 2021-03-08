import { createContext } from 'react';

interface QuickBarContextInterface {
  removeAtPath: (path: number[], valueIdx?: number) => void
}

export const QuickBarContext = createContext<QuickBarContextInterface>({
  removeAtPath: () => {}
});
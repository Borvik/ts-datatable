import { createContext } from 'react';

interface FilterEditorContextInterface {
  errorCount: number
  incrementErrorCount: () => void
  decrementErrorCount: () => void
}

export const FilterEditorContext = createContext<FilterEditorContextInterface>({
  errorCount: 0,
  incrementErrorCount: () => {},
  decrementErrorCount: () => {},
});
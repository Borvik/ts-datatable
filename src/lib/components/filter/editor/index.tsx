import React, { useCallback, useState } from 'react';
import { QueryFilterGroup } from '../../table/types';
import { FilterGroupEditor } from './group';
import update, { Spec } from 'immutability-helper';
import { FilterEditorContext } from './context';

// type FilterAction = 'set' | 'update' | 'remove' | 'add';
interface Props {
  value: QueryFilterGroup;
  onChange: React.Dispatch<React.SetStateAction<QueryFilterGroup>>;
}

export const FilterEditor: React.FC<Props> = (props: Props, ref) => {
  const [errorCount, setErrorCount] = useState(0);
  const { value, onChange } = props;

  const setEditorState = useCallback((path: number[], $spec: Spec<QueryFilterGroup>) => {
    // immutably update data, and call onChange
    if (!path.length) {
      // @ts-ignore
      onChange(val => update(val, $spec));
      return;
    }
    // update(value, { filters: { [0]: _____  } })
    
    for (let i = path.length - 1; i >=0; i--) {
      let idx = path[i];
      // @ts-ignore
      $spec = { filters: { [idx]: $spec } };
    }
    onChange(val => update(val, $spec));
  }, [ onChange ]);

  function incrementErrorCount() {
    setErrorCount(prev => prev + 1);
  }
  function decrementErrorCount() {
    setErrorCount(prev => prev - 1);
  }

  return (
    <FilterEditorContext.Provider
      value={{
        errorCount,
        incrementErrorCount,
        decrementErrorCount,
      }}
    >
      <div className='filter-editor'>
        <FilterGroupEditor
          value={value}
          setState={setEditorState}
        />
      </div>
    </FilterEditorContext.Provider>
  );
};
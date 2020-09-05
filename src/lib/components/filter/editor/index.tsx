import React, { useCallback } from 'react';
import { QueryFilterGroup } from '../../table/types';
import { FilterGroupEditor } from './group';
import { Spec, update } from '../../../utils/immutable';

interface Props {
  value: QueryFilterGroup;
  onChange: React.Dispatch<React.SetStateAction<QueryFilterGroup>>;
}

export const FilterEditor: React.FC<Props> = (props: Props, ref) => {
  const { value, onChange } = props;

  const setEditorState = useCallback((path: number[], $spec: Spec<QueryFilterGroup>) => {
    // immutably update data, and call onChange
    if (!path.length) {
      // @ts-ignore
      onChange(val => update(val, $spec));
      return;
    }
    
    for (let i = path.length - 1; i >= 0; i--) {
      let idx = path[i];
      // @ts-ignore
      $spec = { filters: { [idx]: $spec } };
    }
    onChange(val => update(val, $spec));
  }, [ onChange ]);

  return <div className='filter-editor'>
    <FilterGroupEditor
      value={value}
      setState={setEditorState}
    />
  </div>;
};
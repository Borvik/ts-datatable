import React from 'react';
import { ColumnSort, ColumnSorts } from '../components/table/types';

type SetColumnSortFn = React.Dispatch<React.SetStateAction<ColumnSorts>>;

export function doSetColumnSort(setColumnSort: SetColumnSortFn, newSort: ColumnSort, shiftKey: boolean, multiColumnSorts: boolean) {
  if (multiColumnSorts && shiftKey) {
    setColumnSort(state => {
      const sort = state.sort.find(s => s.column === newSort.column);
      if (sort) {
        return {
          sort: state.sort.map(s => {
            if (sort.column === s.column)
              return newSort;
            return s;
          })
        };
      } else {
        return {
          sort: [
            ...state.sort,
            newSort,
          ]
        };
      }
    });
  } else {
    setColumnSort({ sort: [ newSort ] });
  }
}
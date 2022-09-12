import React, { useContext } from 'react';
import { ColumnContext, useTableSelector } from '../table/contexts';
import { RowSelectorCheckbox } from './checkbox';
import isEqual from 'lodash/isEqual';
import { TableDataContext } from '../table/data-provider';

interface AllRowsSelectorProps<T> {
  
}

export const AllRowsSelector = function AllRowsSelector<T>({ ...props }: AllRowsSelectorProps<T>) {
  const { data } = useContext(TableDataContext);
  const {
    canSelectRow,
    setAllSelected,
    components,
  } = useContext(ColumnContext);

  const [{ selectedRows }] = useTableSelector(c => ({ selectedRows: c.selectedRows }), isEqual);
  
  const Checkbox = components?.RowCheckbox ?? RowSelectorCheckbox;

  const rowData = data ?? [];
  const filteredRowData = rowData.filter(rw => (typeof canSelectRow !== 'function' || canSelectRow(rw)));
  const selectedKeys = Object.keys(selectedRows);

  const isChecked = (!!filteredRowData.length && selectedKeys.length === filteredRowData.length);
  const isIndeterminite = (!!filteredRowData.length && !!selectedKeys.length && filteredRowData.length !== selectedKeys.length);
  
  return (
    <div>
      <Checkbox
        checked={isChecked}
        indeterminate={isIndeterminite}
        onChange={() => {
          if (!filteredRowData.length) return;
          setAllSelected(!!filteredRowData.length && selectedKeys.length !== filteredRowData.length, filteredRowData)
        }}
      />
    </div>
  );
}
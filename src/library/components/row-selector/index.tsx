import React, { useContext } from 'react';
import { ColumnContext, useTableSelector } from '../table/contexts';
import { getRowKey } from '../../utils/getRowKey';
import isEqual from 'lodash/isEqual';
import { RowSelectorCheckbox } from './checkbox';
import { AllRowsSelector } from './select-all';

interface RowSelectorProps<T> {
  row: T;
  rowIndex: number;
}

export const RowSelector = function RowSelector<T>({ row, rowIndex, ...props }: RowSelectorProps<T>) {
  const {
    actualColumns: columns,
    canSelectRow,
    getRowKey: propsGetRowKey,
    setRowSelected,
    components,
  } = useContext(ColumnContext);

  const Checkbox = components?.RowCheckbox ?? RowSelectorCheckbox;

  if (rowIndex < 0) {
    // Select ALL
    return <AllRowsSelector />;
  }

  if (typeof canSelectRow === 'function' && !canSelectRow(row)) {
    return <></>;
  }

  const rowKey = getRowKey(row, rowIndex, columns, propsGetRowKey)
  const [{ isSelected }] = useTableSelector(c => ({
    isSelected: typeof c.selectedRows[rowKey] !== 'undefined'
  }), isEqual);

  return <div>
    <Checkbox
      row={row}
      checked={isSelected}
      indeterminate={false}
      onChange={() => setRowSelected(row, rowIndex)}
    />
  </div>
};
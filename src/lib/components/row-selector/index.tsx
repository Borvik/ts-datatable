import React, { useContext } from 'react';
import { ColumnContext } from '../table/contexts';
import { getRowKey } from '../../utils/getRowKey';

interface RowSelectorProps {
  row: any;
  rowIndex: number;
  data?: any[]
}

export const RowSelector: React.FC<RowSelectorProps> = ({ row, rowIndex, ...props }) => {
  const {
    actualColumns: columns,
    canSelectRow,
    getRowKey: propsGetRowKey,
    selectedRows,
    setRowSelected,
    setAllSelected,
    components,
  } = useContext(ColumnContext);

  const Checkbox = components?.RowCheckbox ?? RowSelectorCheckbox;

  if (rowIndex < 0) {
    // Select ALL
    const rowData = props.data ?? [];
    const filteredRowData = rowData.filter(rw => (typeof canSelectRow !== 'function' || canSelectRow(rw)));
    const selectedKeys = Object.keys(selectedRows);

    const isChecked = (!!filteredRowData.length && selectedKeys.length === filteredRowData.length);
    const isIndeterminite = (!!filteredRowData.length && !!selectedKeys.length && filteredRowData.length !== selectedKeys.length);
    return <div>
      <Checkbox
        checked={isChecked}
        indeterminate={isIndeterminite}
        onChange={() => {
          if (!filteredRowData.length) return;
          setAllSelected(!!filteredRowData.length && selectedKeys.length !== filteredRowData.length)
        }}
      />
    </div>;
  }

  if (typeof canSelectRow === 'function' && !canSelectRow(row)) {
    return <></>;
  }

  const rowKey = getRowKey(row, rowIndex, columns, propsGetRowKey)
  const isSelected = typeof selectedRows[rowKey] !== 'undefined';

  return <div>
    <Checkbox
      checked={isSelected}
      indeterminate={false}
      onChange={() => setRowSelected(row, rowIndex)}
    />
  </div>
};

export interface RowSelectorCheckboxProps {
  checked: boolean
  indeterminate: boolean
  onChange: React.InputHTMLAttributes<HTMLInputElement>['onChange']
}

export const RowSelectorCheckbox: React.FC<RowSelectorCheckboxProps> = ({ indeterminate, checked, onChange }) => {
  return <input
    type='checkbox'
    ref={(el) => el && (el.indeterminate = indeterminate)}
    checked={checked}
    onChange={onChange}
  />;
}
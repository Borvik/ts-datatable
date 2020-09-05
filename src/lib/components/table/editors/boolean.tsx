import React, { useContext } from 'react';
import { EditorProps } from './types';
import { ColumnContext } from '../contexts';
import { getRowValue } from '../../../utils/getRowKey';
import { update } from '../../../utils/immutable';
import get from 'lodash/get';

export const BooleanEditor: React.FC<EditorProps> = ({row, column, value}) => {
  const { actualColumns: columns, editData, setFormData, getRowKey } = useContext(ColumnContext);

  // yes we should be able to count on this
  // earlier validation assures editing only if either
  // getRowKey is set OR a primary key column is set
  let primaryColumn = columns.find(c => c.isPrimaryKey);
  let keyValue = typeof getRowKey === 'function'
    ? getRowKey(row)
    : getRowValue(row, primaryColumn!);

  let columnPath = `${keyValue}.${column.key}`;
  let actualValue = get(editData, columnPath, value);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let fieldValue: any = e.target.checked;

    setFormData(form => update(form, {
      [keyValue]: { $auto: {
        [column.key]: { $set: fieldValue }
      } }
    }));
  }

  return <input type='checkbox' checked={actualValue} onChange={onChange} />;
}
import React, { useContext } from 'react';
import { EditorProps } from './types';
import { CustomColumnEditor } from '../types';
import { ColumnContext } from '../contexts';
import { getRowValue } from '../../../utils/getRowKey';
import { update } from '../../../utils/immutable';
import get from 'lodash/get';

export const CustomEditor: React.FC<EditorProps> = ({row, column, value}) => {
  const { actualColumns: columns, editData, setFormData, getRowKey } = useContext(ColumnContext);
  const Editor = (column.editor as CustomColumnEditor<any>).Editor;

  // yes we should be able to count on this
  // earlier validation assures editing only if either
  // getRowKey is set OR a primary key column is set
  let primaryColumn = columns.find(c => c.isPrimaryKey);
  let keyValue = typeof getRowKey === 'function'
    ? getRowKey(row)
    : getRowValue(row, primaryColumn!);

  let columnPath = `${keyValue}.${column.key}`;
  let actualValue = get(editData, columnPath, value);

  function onChange(newValue: any) {
    setFormData(form => update(form, {
      [keyValue]: { $auto: {
        [column.key]: { $set: newValue }
      } }
    }));
  }

  return <Editor
    value={actualValue}
    row={row}
    column={column}
    setValue={onChange}
  />;
}
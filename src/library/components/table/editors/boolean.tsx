import React, { useContext } from 'react';
import { EditorProps } from './types';
import { ColumnContext, useTableSelector } from '../contexts';
import { getRowValue } from '../../../utils/getRowKey';
import { update } from '../../../utils/immutable';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

export const BooleanEditor: React.FC<EditorProps> = function BooleanEditor({row, column, value}) {
  const {
    actualColumns: columns,
    // editData,
    // setFormData,
    getRowKey,
    // editMode,
    onSaveQuickEdit
  } = useContext(ColumnContext);

  // yes we should be able to count on this
  // earlier validation assures editing only if either
  // getRowKey is set OR a primary key column is set
  let primaryColumn = columns.find(c => c.isPrimaryKey);
  let keyValue = typeof getRowKey === 'function'
    ? getRowKey(row)
    : getRowValue(row, primaryColumn!);

  const [{
    rowData,
    editMode,
  }, setCtxData] = useTableSelector(c => {
    let rowData = get(c.editData, keyValue, {});
    return {
      rowData,
      editMode: c.editMode,
    };
  }, isEqual);

  let actualValue = get(rowData, column.key, value);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let fieldValue: any = e.target.checked;

    if (editMode === 'autosave') {
      onSaveQuickEdit({ [column.key]: fieldValue });
    } else {
      setCtxData(data => update(data, {
        editData: {
          [keyValue]: { $auto: {
            [column.key]: { $set: fieldValue }
          } }
        }
      }));
    }
  }

  return <input type='checkbox' checked={actualValue} onChange={onChange} />;
}
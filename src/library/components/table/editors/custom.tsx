import React, { useContext } from 'react';
import { EditorProps } from './types';
import { CustomColumnEditor } from '../types';
import { ColumnContext, useTableSelector } from '../contexts';
import { getRowValue } from '../../../utils/getRowKey';
import { update } from '../../../utils/immutable';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

export const CustomEditor: React.FC<EditorProps> = function CustomEditor({row, column, value}) {
  const {
    actualColumns: columns,
    getRowKey,
    onSaveQuickEdit,
  } = useContext(ColumnContext);
  const Editor = (column.editor as CustomColumnEditor<any>).Editor;

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
    if (keyValue == '69') {
      console.log('rowData:', rowData);
    }
    return {
      rowData,
      editMode: c.editMode,
    };
  }, isEqual);

  let actualValue = get(rowData, column.key, value);

  function onChange(newValue: any) {
    setCtxData(data => update(data, {
      editData: {
        [keyValue]: { $auto: {
          [column.key]: { $set: newValue }
        } }
      }
    }))
  }

  function autoSave() {
    if (Object.keys(rowData as object).length)
      onSaveQuickEdit({[keyValue]: rowData as any});
  }

  return <Editor
    value={actualValue}
    originalValue={value}
    row={row}
    column={column}
    setValue={onChange}
    autoSave={autoSave}
    editMode={editMode}
  />;
}
import React, { useState, useRef, useEffect, useContext } from 'react';
import { EditorProps } from './types';
import { InputType } from '../types';
import { ColumnContext, useTableSelector } from '../contexts';
import { getRowValue } from '../../../utils/getRowKey';
import { update } from '../../../utils/immutable';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

interface InputEditorProps extends EditorProps {
  type: InputType
}

export const InputEditor: React.FC<InputEditorProps> = function InputEditor({row, column, value, type}) {
  const {
    actualColumns: columns,
    getRowKey,
    onSaveQuickEdit,
  } = useContext(ColumnContext);

  const [inputWidth, setWidth] = useState(null as string | null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (inputRef.current) {
      let parent = inputRef.current.parentElement as Element;
      let afterStyle = window.getComputedStyle(parent, ':after');
      setWidth(afterStyle.width);
    }
  }, [actualValue]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let fieldValue: any = e.target.value;
    if (e.target.type === 'number')
      fieldValue = e.target.valueAsNumber;

    setCtxData(data => update(data, {
      editData: {
        [keyValue]: { $auto: {
          [column.key]: { $set: fieldValue }
        } }
      }
    }));
  }

  function onBlur(_e: React.FocusEvent<HTMLInputElement>) {
    if (Object.keys(rowData as object).length) {
      onSaveQuickEdit({[keyValue]: rowData as any});
    }
  }

  return <span className='input-sizer' data-value={actualValue}>
    <input
      style={{ '--width': inputWidth ?? undefined } as any}
      ref={inputRef}
      type={type}
      value={actualValue ?? ''}
      onChange={onChange}
      onBlur={editMode === 'autosave' ? onBlur : undefined}
    />
  </span>;
}
import React, { useState, useRef, useEffect } from 'react';
import { EditorProps, getValue } from './types';
import { setValue } from './setValue';
import { isEmpty } from '../../../../utils/isEmpty';
import { isset } from '../../../../utils/isset';
import { CustomColumnFilter } from '../../../table/types';

interface CustomEditorProps extends EditorProps {
  filterDef: CustomColumnFilter
}

export const CustomEditor: React.FC<CustomEditorProps> = ({ filterDef, filter, valuePath, setState, path, index }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLElement | null>(null);
  const focusRef = useRef<HTMLElement | null>(null);
  const Editor = filterDef.Editor;
  
  useEffect(() => {
    if (!editing) return;

    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && inputRef.current !== e.target && !inputRef.current?.contains(e.target as any)) {
        setEditing(false);
      }
    }
    if (focusRef.current)
      focusRef.current.focus();
    else
      inputRef.current?.focus();

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editing, setEditing]);

  function customOnChange(newValue: any) {
    setValue({setState, path, index, valuePath, value: newValue, filter});
  }

  function onBlur() {
    setEditing(false);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      setEditing(true);
    }
  }

  if (!editing) {
    let value = filterDef.toDisplay(getValue(filter.value, valuePath));
    if (!isset(value))
      value = <span className='no-value'>&lt;enter a value&gt;</span>
    else if (isEmpty(value))
      value = <span className='no-value'>&lt;empty&gt;</span>;
    return <span className='filter-editor-value' tabIndex={0} onKeyDown={onKey} onClick={() => setEditing(true)}>{value}</span>;
  }

  let value = getValue(filter.value, valuePath);
  let allValues = getValue(filter.value, null);
  return <Editor
    inputRef={inputRef}
    focusRef={focusRef}
    value={value}
    allValues={allValues}
    setValue={customOnChange}
    onLoseFocus={onBlur}
  />;
};
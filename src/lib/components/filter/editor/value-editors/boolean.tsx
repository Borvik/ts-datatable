import React, { useState, useCallback, useEffect, useRef } from 'react';
import { EditorProps, getValue } from './types';
import { isset } from '../../../../utils/isset';
import { setValue } from './setValue';



export const BooleanEditor: React.FC<EditorProps> = ({ setState, path, index, filter, valuePath }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const enableEditing = useCallback(() => setEditing(true), [ setEditing ]);
  const disableEditing = useCallback(() => {
    let currentValue = getValue(filter.value, valuePath);
    if (!isset(currentValue)) {
      setValue({setState, path, index, valuePath, value: false, filter});
    }
    setEditing(false);
  }, [setEditing, filter, valuePath, path, index, setState]);
  
  useEffect(() => {
    if (!editing) return;

    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && inputRef.current !== e.target && !inputRef.current?.contains(e.target as any)) {
        disableEditing();
      }
    }
    inputRef.current?.focus();

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editing, disableEditing]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let checked = e.target.checked;
    setValue({setState, path, index, valuePath, value: checked, filter});
  }

  function onBlur(_e: React.FocusEvent<HTMLInputElement>) {
    setEditing(false);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      setEditing(true);
    }
  }

  if (!editing) {
    let value: React.ReactNode = getValue(filter.value, valuePath);
    if (!isset(value))
      value = <span className='no-value'>&lt;enter a value&gt;</span>
    else
      value = value ? 'Checked' : 'Unchecked';
    return <span className='filter-editor-value' tabIndex={0} onKeyDown={onKey} onClick={enableEditing}>{value}</span>
  }

  let value = getValue(filter.value, valuePath) ?? false;
  return <input ref={inputRef} type='checkbox' checked={!!value} onBlur={onBlur} onChange={onChange} />;
};
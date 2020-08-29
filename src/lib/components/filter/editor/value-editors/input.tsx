import React, { useState, useEffect, useRef } from 'react';
import { isEmpty, isset } from './isEmpty';
import { setValue } from './setValue';
import { EditorProps, getValue } from './types';

export const InputEditor: React.FC<EditorProps> = ({ filter, type, setState, path, index, valuePath }) => {
  const [editing, setEditing] = useState(false);
  const [inputWidth, setWidth] = useState(null as string | null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;

    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && inputRef.current !== e.target && !inputRef.current?.contains(e.target as any)) {
        setEditing(false);
      }
    }
    inputRef.current?.focus();

    if (inputRef.current) {
      let parent = inputRef.current.parentElement as Element;
      let afterStyle = window.getComputedStyle(parent, ':after');
      setWidth(afterStyle.width);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editing, setEditing]);

  useEffect(() => {
    if (inputRef.current) {
      let parent = inputRef.current.parentElement as Element;
      let afterStyle = window.getComputedStyle(parent, ':after');
      setWidth(afterStyle.width);
    }
  }, [filter.value])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value: any = e.target.value;
    if (e.target.type === 'number')
      value = e.target.valueAsNumber;
    setValue({setState, path, index, valuePath, value, filter});
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
    else if (isEmpty(value))
      value = <span className='no-value'>&lt;empty&gt;</span>;
    return <span className='filter-editor-value' tabIndex={0} onKeyDown={onKey} onClick={() => setEditing(true)}>{value}</span>
  }

  let value = getValue(filter.value, valuePath) ?? '';
  if (typeof value === 'number' && Number.isNaN(value))
    value = '';
  return <span className='input-sizer' data-value={value}>
    <input style={{ width: inputWidth ?? undefined }} ref={inputRef} type={type} value={value} onBlur={onBlur} onChange={onChange} />
  </span>;
}
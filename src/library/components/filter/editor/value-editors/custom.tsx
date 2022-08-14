import React, { useState, useRef, useEffect } from 'react';
import { EditorProps, getValue } from './types';
import { setValue } from './setValue';
import { isEmpty } from '../../../../utils/isEmpty';
import { isset } from '../../../../utils/isset';
import { CustomColumnFilter } from '../../../table/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';

interface CustomEditorProps extends EditorProps {
  filterDef: CustomColumnFilter
  useMulti?: boolean
}

export const CustomEditor: React.FC<CustomEditorProps> = function CustomEditor({ useMulti, filterDef, filter, valuePath, setState, path, index }) {
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

  if (useMulti) {
    function removeValue(idxToRemove: number) {
      setState(path, {
        filters: {
          [index]: {
            value: { $splice: [[idxToRemove, 1]]}
          }
        }
      });
    }

    let value: undefined | null | any[] = getValue(filter.value, null);
    if (!editing) {
      let { value: noValues, ...filterWithoutValues} = filter;
      let displayValue: any[] = [];
      let keyBase: any[] = [];
      if (!value?.length || (value.length === 1 && value[0] == null)) {
        keyBase.push(JSON.stringify({
          ...filterWithoutValues,
          idx: -1,
        }));
        displayValue = [
          <span className='no-value'>&lt;enter a value&gt;</span>
        ];
      }
      else {
        // generate display values
        value.forEach((val, idx) => {
          let dspValue = filterDef.toDisplay(getValue(val, null));
          displayValue.push(dspValue);
          keyBase.push(JSON.stringify({
            ...filterWithoutValues,
            idx
          }));
        });
      }
      return <>
        {displayValue.map((val, idx, arr) => {
          return <span className='multi-value-editor' key={keyBase[idx] + '_' + idx}>
            <span className='filter-editor-value' tabIndex={0} onKeyDown={onKey} onClick={() => setEditing(true)}>{val}</span>
            {arr.length > 1 && <button type='button' data-noautofocus className='filter-mv-item-remove filter-btn' onClick={() => removeValue(idx)}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </button>}
          </span>
        })}
      </>
    }

    // parent should have already checked filterDef.MultiEditor - so that should be safe
    const MultiEditor = filterDef.MultiEditor!;
    return <MultiEditor
      inputRef={inputRef}
      focusRef={focusRef}
      value={value!}
      allValues={value}
      setValue={customOnChange}
      onLoseFocus={onBlur}
      editorOptions={filterDef.editorOptions}
    />
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
    editorOptions={filterDef.editorOptions}
  />;
};
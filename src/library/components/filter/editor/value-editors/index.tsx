import React from 'react';
import { QueryFilterItem, DataColumn, CustomColumnFilter, isCustomFilter } from '../../../table/types';
import { SetEditorStateFn } from '../../types';
import { InputEditor } from './input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { BooleanEditor } from './boolean';
import { CustomEditor } from './custom';

interface Props {
  column?: DataColumn<any>
  filter: QueryFilterItem
  path: number[];
  index: number;
  setState: SetEditorStateFn;
}

export const FilterValueEditor: React.FC<Props> = function FilterValueEditor(props) {
  const { filter: { operator } } = props;
  switch (operator) {
    case 'nul':
    case 'nnul':
      return <></>; // Null checks don't have values
    case 'bet':
    case 'nbet':
      return <DoubleValueEditor {...props} />;
    case 'any':
    case 'none':
      return <MultiValueEditor {...props} />;
    default:
      return <SingleValueEditor {...props} />;
  }
};

interface SingleValueProps extends Props {
  valuePath?: number | null;
}
const SingleValueEditor: React.FC<SingleValueProps> = function SingleValueEditor({ column, valuePath, ...rest }) {
  if (!column) return <span className='filter-editor-value'><span className='no-value'>&lt;Choose Column&gt;</span></span>;

  switch (column.filter!.type) {
    case 'email':
    case 'number':
    case 'string':
      let actualType: string = column.filter!.type;
      if (actualType === 'string')
        actualType = 'text';
      return <InputEditor type={actualType} valuePath={valuePath ?? null} {...rest} />
    case 'boolean':
      return <BooleanEditor type={column.filter!.type} valuePath={valuePath ?? null} {...rest} />
    case 'custom':
      return <CustomEditor filterDef={column.filter as CustomColumnFilter} type={column.filter!.type} valuePath={valuePath ?? null} {...rest} />
    default:
      return <span className='filter-editor-value'><span className='no-value'>&lt;Unknown Filter Type&gt;</span></span>
  }
}

const DoubleValueEditor: React.FC<Props> = function DoubleValueEditor({ column, ...rest }) {
  if (!column) return <span className='filter-editor-value'><span className='no-value'>&lt;Choose Column&gt;</span></span>;

  return <>
    <SingleValueEditor column={column} valuePath={0} {...rest} />
    <span className='double-value-separator'>and</span>
    <SingleValueEditor column={column} valuePath={1} {...rest} />
  </>
}

const MultiValueEditor: React.FC<Props> = function MultiValueEditor({ column, filter, setState, ...rest }) {
  if (!column) return <span className='filter-editor-value'><span className='no-value'>&lt;Choose Column&gt;</span></span>;
  
  function addValue() {
    const { path, index } = rest;
    setState(path, {
      filters: {
        [index]: {
          value: { $push: [null] }
        }
      }
    });
  }

  function removeValue(idxToRemove: number) {
    const { path, index } = rest;
    setState(path, {
      filters: {
        [index]: {
          value: { $splice: [[idxToRemove, 1]]}
        }
      }
    });
  }

  let values: any[] = filter.value ?? [];
  let { value: noValues, ...filterWithoutValues} = filter;
  let valueKeyBase = JSON.stringify({
    ...filterWithoutValues,
    path: rest.path,
    idx: rest.index,
  });
  
  if (isCustomFilter(column.filter) && !!column.filter.MultiEditor) {
    return <CustomEditor useMulti filterDef={column.filter as CustomColumnFilter} setState={setState} filter={filter} type={column.filter!.type} valuePath={null} {...rest} />
  }
  
  return <>({values.map((_value, index, arr) => (
    <span className='multi-value-editor' key={valueKeyBase + '_' + index}>
      <SingleValueEditor column={column} setState={setState} valuePath={index} filter={filter} {...rest} />
      {arr.length > 1 && <button type='button' data-noautofocus className='filter-mv-item-remove filter-btn' onClick={() => removeValue(index)}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </button>}
    </span>
  ))}
    <button type='button' data-noautofocus className='filter-mv-item-add filter-btn' onClick={addValue}>
      <FontAwesomeIcon icon={faPlusCircle} />
    </button>)</>
}
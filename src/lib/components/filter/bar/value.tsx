import React, { useContext } from 'react';
import { QueryFilterItem, DataColumn, CustomColumnFilter } from '../../table/types';
import { getValue } from '../editor/value-editors/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { QuickBarContext } from './context';

interface Props {
  column: DataColumn<any>
  filter: QueryFilterItem
  path: number[]
}

export const QuickFilterValue: React.FC<Props> = (props) => {
  switch (props.filter.operator) {
    case 'nul':
    case 'nnul':
      return <></>; // Nulls don't have values
    case 'bet':
    case 'nbet':
      return <DoubleValue {...props} />;
    case 'any':
    case 'none':
      return <MultiValue {...props} />;
    default:
      return <SingleValue {...props} />;
  }
}

const DoubleValue: React.FC<Props> = (props) => {
  return <>
    {'['}
    <SingleValue {...props} valuePath={0} />
    <span className='double-value-separator'>and</span>
    <SingleValue {...props} valuePath={1} />
    {']'}
  </>
}

const MultiValue: React.FC<Props> = (props) => {
  const { removeAtPath } = useContext(QuickBarContext);

  let values: any[] = props.filter.value ?? [];
  let valueKeyBase = JSON.stringify(values);
  return <>[{values.map((_value, index, arr) => (
    <span className='multi-value-value' key={valueKeyBase + '_' + index}>
      {arr.length > 1 && <button onClick={() => removeAtPath(props.path, index)} type='button' className='quick-filter-value-remove-btn'>
        <FontAwesomeIcon icon={faTimesCircle} />
      </button>}
      <span>
        <SingleValue {...props} valuePath={index} />
      </span>
    </span>
  ))}]</>
}

interface SingleValueProps extends Props {
  valuePath?: number | null
}

const SingleValue: React.FC<SingleValueProps> = ({ column, filter, valuePath }) => {
  let value: React.ReactNode = getValue(filter.value, valuePath ?? null)

  switch (column.filter!.type) {
    case 'boolean':
      return <>{value ? 'true' : 'false'}</>;
    case 'custom':
      return <>{(column.filter as CustomColumnFilter).toDisplay(value)}</>;
    default:
      return <>{value}</>;
  }
}
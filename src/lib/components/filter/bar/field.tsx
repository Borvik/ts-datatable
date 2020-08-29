import React, { useContext } from 'react';
import { QueryFilterItem, QuickOperatorLabels, DataColumn } from '../../table/types';
import { ColumnContext } from '../../table/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { QuickFilterValue } from './value';
import { QuickBarContext } from './context';

interface Props {
  column: DataColumn<any>
  filter: QueryFilterItem
  path: number[]
}

export const QuickFilterItem: React.FC<Props> = ({ filter, column, path }) => {
  const { filterSettings } = useContext(ColumnContext);
  const { removeAtPath } = useContext(QuickBarContext);

  return <span className='quick-filter-field-container'>
    <button onClick={() => removeAtPath(path)} type='button' className='quick-filter-item-remove-btn filter-btn'>
      <FontAwesomeIcon icon={faTimesCircle} />
    </button>
    <span className='quick-filter-field'>
      <span className='quick-filter-field-name'>{column?.filter?.label ?? column?.header ?? <i>No column</i>}</span>
      <span className='quick-filter-field-operator'>
        {filterSettings?.quickOperatorLabels?.[filter.operator] ?? QuickOperatorLabels[filter.operator]}
      </span>
      <span className='quick-filter-field-value'>
        <QuickFilterValue column={column} filter={filter} path={path} />
      </span>
    </span>
  </span>
}
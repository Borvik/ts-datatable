import React, { useContext } from 'react';
import { QueryFilterItem, QuickOperatorLabels, DataColumn } from '../../table/types';
import { ColumnContext } from '../../table/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { QuickFilterValue } from './value';
import { QuickBarContext } from './context';
import get from 'lodash/get';

interface Props {
  column: DataColumn<any>
  filter: QueryFilterItem
  path: number[]
  parentCollectionCount: number
}

export const QuickFilterItem: React.FC<Props> = function QuickFilterItem({ filter, column, path, parentCollectionCount }) {
  const { filterSettings } = useContext(ColumnContext);
  const { removeAtPath } = useContext(QuickBarContext);

  let metaLabel: any = undefined;
  if (typeof column.filter?.metaToDisplay === 'string') {
    if (!column.filter.metaToDisplay) {
      // empty string - use root
      if (filter.meta) metaLabel = filter.meta;
    }
    else {
      let metaDisplay = get(filter.meta, column.filter.metaToDisplay);
      if (metaDisplay) metaLabel = metaDisplay;
    }
  }

  return <span className='quick-filter-field-container'>
    {parentCollectionCount > 1 && <button onClick={() => removeAtPath(path)} type='button' className='quick-filter-item-remove-btn filter-btn'>
      <FontAwesomeIcon icon={faTimesCircle} />
    </button>}
    <span className='quick-filter-field'>
      <span className='quick-filter-field-name'>{column?.filter?.label ?? column?.header ?? <i>No column</i>}{!!metaLabel && <>
        [<i>{metaLabel}</i>]
      </>}</span>
      <span className='quick-filter-field-operator'>
        {filterSettings?.quickOperatorLabels?.[filter.operator] ?? QuickOperatorLabels[filter.operator]}
      </span>
      <span className='quick-filter-field-value'>
        <QuickFilterValue column={column} filter={filter} path={path} />
      </span>
    </span>
  </span>
}
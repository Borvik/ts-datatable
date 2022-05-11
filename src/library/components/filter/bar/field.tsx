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

  let fieldLabel = column?.filter?.label ?? column?.header;
  if (typeof column.filter?.displayAsMeta === 'string') {
    if (!column.filter.displayAsMeta) {
      // empty string - use root
      if (filter.meta) fieldLabel = <i>{filter.meta as any}</i>;
    }
    else {
      let metaLabel = get(filter.meta, column.filter.displayAsMeta);
      if (metaLabel) fieldLabel = <i>{metaLabel}</i>;
    }
  }

  return <span className='quick-filter-field-container'>
    {parentCollectionCount > 1 && <button onClick={() => removeAtPath(path)} type='button' className='quick-filter-item-remove-btn filter-btn'>
      <FontAwesomeIcon icon={faTimesCircle} />
    </button>}
    <span className='quick-filter-field'>
      <span className='quick-filter-field-name'>{fieldLabel ?? <i>No column</i>}</span>
      <span className='quick-filter-field-operator'>
        {filterSettings?.quickOperatorLabels?.[filter.operator] ?? QuickOperatorLabels[filter.operator]}
      </span>
      <span className='quick-filter-field-value'>
        <QuickFilterValue column={column} filter={filter} path={path} />
      </span>
    </span>
  </span>
}
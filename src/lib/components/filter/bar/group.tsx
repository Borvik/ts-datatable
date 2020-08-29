import React, { useContext } from 'react';
import { QueryFilterGroup, isFilterGroup, QueryFilterItem } from '../../table/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { QuickFilterItem } from './field';
import { ColumnContext } from '../../table/contexts';
import { QuickBarContext } from './context';

interface Props {
  value: QueryFilterGroup
  topLevel: boolean
  path?: number[]
}

export const QuickFilterGroup: React.FC<Props> = ({ topLevel, value, path }) => {
  const { actualColumns } = useContext(ColumnContext);
  const { removeAtPath } = useContext(QuickBarContext);

  const prefix = '(', suffix = ')';
  const currentPath = path ?? [];
  // const currentPathAsString = currentPath.join(',');

  let groupContents: any[] = [];
  for (let idx = 0; idx < value.filters.length; idx++) {
    let filter = value.filters[idx];
    let newPath = [...currentPath, idx];
    if (groupContents.length) groupContents.push(` ${value.groupOperator} `);
    if (isFilterGroup(filter)) groupContents.push(<QuickFilterGroup key={newPath.join(',')} topLevel={false} value={filter} path={newPath} />)
    else {
      let column = actualColumns.find(c => c.filter?.filterKey === (filter as QueryFilterItem).column);
      if (column) {
        groupContents.push(<QuickFilterItem path={newPath} key={newPath.join(',')} column={column} filter={filter} />);
      }
    }
  }

  return <span className='quick-filter-group-container'>
    <button onClick={() => removeAtPath(currentPath)} type='button' className='quick-filter-item-remove-btn filter-btn'>
      <FontAwesomeIcon icon={faTimesCircle} />
    </button>
    <span className='quick-filter-group'>
      <span className='quick-filter-group-prefix'>{prefix}</span>
      <span className='quick-filter-group-contents'>
        {groupContents}
      </span>
      <span className='quick-filter-group-suffix'>{suffix}</span>
    </span>
  </span>
}
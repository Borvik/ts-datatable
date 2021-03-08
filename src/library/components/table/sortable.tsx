import React, {} from 'react';
import { DataColumn, ColumnSort } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { faSortUp } from '@fortawesome/free-solid-svg-icons/faSortUp';
import { faSortDown } from '@fortawesome/free-solid-svg-icons/faSortDown';

interface HeaderSortProps {
  column: DataColumn<any>;
  sort?: ColumnSort;
}

export const HeaderSort: React.FC<HeaderSortProps> = function HeaderSort(props) {
  const { column, sort } = props;
  if (!column.sortable || column.colSpan > 1 || !column.name) return null;
  if (sort) {
    if (sort.direction === 'asc')
      return <FontAwesomeIcon icon={faSortUp} className='sort-icon' />;
    return <FontAwesomeIcon icon={faSortDown} className='sort-icon' />;
  }
  return <FontAwesomeIcon icon={faSort} style={{opacity: .3}} className='sort-icon' />;
}
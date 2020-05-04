import React, {} from 'react';
import { DataColumn } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { faSortUp } from '@fortawesome/free-solid-svg-icons/faSortUp';

// import {ReactComponent as Sort} from '@fortawesome/fontawesome-free/svgs/solid/sort.svg';

interface HeaderSortProps {
  column: DataColumn<any>;
}

export const HeaderSort: React.FC<HeaderSortProps> = (props) => {
  const { column } = props;
  if (!column.sortable || column.colSpan > 1) return null;
  if (column.header === 'ID')
    return <FontAwesomeIcon icon={faSortUp} className='sort-icon' />;
  return <FontAwesomeIcon icon={faSort} style={{opacity: .3}} className='sort-icon' />;
}
import React, { useContext } from 'react';
import { ColumnContext } from '../../table/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { useDialog } from '../../dialog';
import { FilterDialog } from '../dialog';

export const FilterBar: React.FC = (props) => {
  const { dialog, showDialog } = useDialog(<FilterDialog />);
  const { filter } = useContext(ColumnContext);

  async function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      await showDialog();
    }
    catch (err) {
      console.error(err);
    }
  }

  if (!filter.filters.length) return <></>;

  return <div className='filter-bar'>
    {dialog}
    <button type='button' onClick={onButtonClick}>
      <FontAwesomeIcon icon={faFilter} />
    </button>
    <div className="quick-filter">
      filter goes here
    </div>
  </div>
}
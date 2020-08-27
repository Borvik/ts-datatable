import React, { useContext } from 'react';
import { useDialog } from '../dialog';
import { FilterDialog } from './dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { ColumnContext } from '../table/contexts';

export { FilterBar } from './bar';

export const FilterButton: React.FC = (props) => {
  const { dialog, showDialog } = useDialog(<FilterDialog />);
  const { actualColumns } = useContext(ColumnContext);

  async function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      await showDialog();
    }
    catch (err) {
      console.error(err);
    }
  }

  let canFilter: boolean = false;
  for (let col of actualColumns) {
    if (col.filter?.filterKey) {
      canFilter = true;
      break;
    }
  }

  if (!canFilter) return <></>;
  return <>
    {dialog}
    <button type='button' onClick={onButtonClick}>
      <FontAwesomeIcon icon={faFilter} />
    </button>
  </>;
}
import React, { useContext } from 'react';
import { useDialog } from '@borvik/use-dialog';
import { FilterDialog } from './dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { ColumnContext } from '../table/contexts';
import { batchedQSUpdate } from '../../utils/useQueryState';
import { QueryFilterGroup } from '../table/types';

export { FilterBar } from './bar';

export const FilterButton: React.FC = (props) => {
  const { dialog, showDialog } = useDialog(<FilterDialog />);
  const {
    filterColumns,
    isEditing,
    classNames,
    labels,
    filter,
    components,
    setFilter,
    setPagination,
    onShowFilterEditor,
  } = useContext(ColumnContext);

  function applyFilter(filterState: QueryFilterGroup) {
    batchedQSUpdate(() => {
      setFilter(filterState);
      setPagination({ page: 1 });
    });
  }

  async function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      if (onShowFilterEditor) {
        await onShowFilterEditor(filter, applyFilter, e.currentTarget);
      } else {
        await showDialog();
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  let canFilter: boolean = false;
  for (let col of filterColumns) {
    if (col.filter?.filterKey) {
      canFilter = true;
      break;
    }
  }

  if (!canFilter) return <></>;

  let btnFilterClass: string | undefined;
  if (classNames?.actionButton || classNames?.actionButtonFilter) {
    btnFilterClass = `${classNames?.actionButton ?? ''} ${classNames?.actionButtonFilter ?? ''}`.trim();
  }

  const CustomButton = components?.Buttons?.Filter;

  return <>
    {dialog}
    {!!CustomButton && <CustomButton disabled={isEditing} onClick={onButtonClick} />}
    {!CustomButton && <button type='button' title={labels?.filter ?? 'Filter'} className={btnFilterClass} disabled={isEditing} onClick={onButtonClick}>
      <FontAwesomeIcon icon={faFilter} />
    </button>}
  </>;
}
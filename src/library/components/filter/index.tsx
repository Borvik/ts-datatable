import React, { useContext } from 'react';
import { useDialog } from '@borvik/use-dialog';
import { FilterDialog } from './dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { ColumnContext, useTableSelector } from '../table/contexts';
import { batchedQSUpdate } from '@borvik/use-querystate';
import { QueryFilterGroup } from '../table/types';
import isEqual from 'lodash/isEqual';

export { FilterBar } from './bar';

export const FilterButton: React.FC = function FilterButton() {
  const { dialog, showDialog } = useDialog(<FilterDialog />);
  const {
    filterColumns,
    classNames,
    labels,
    filter,
    components,
    setFilter,
    setPagination,
    onShowFilterEditor,
  } = useContext(ColumnContext);

  const [{
    isEditing,
    editMode,
  }] = useTableSelector(c => ({
    isEditing: c.isEditing,
    editMode: c.editMode,
  }), isEqual);

  function applyFilter(filterState: QueryFilterGroup) {
    batchedQSUpdate(() => {
      setFilter(filterState);
      setPagination(prev => ({ ...prev, page: 1 }));
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
    {!!CustomButton && <CustomButton disabled={isEditing && editMode === 'default'} onClick={onButtonClick} />}
    {!CustomButton && <button type='button' title={labels?.filter ?? 'Filter'} className={btnFilterClass} disabled={isEditing && editMode === 'default'} onClick={onButtonClick}>
      <FontAwesomeIcon icon={faFilter} />
    </button>}
  </>;
}
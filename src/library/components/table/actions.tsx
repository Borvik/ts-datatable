import React, { MouseEventHandler, useCallback, useContext } from 'react';
import { ColumnContext } from './contexts';
import { DataTableProperties } from './types';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TableDataContext } from './data-provider';

export interface TableActionButtonsProps {
  position: 'top' | 'bottom'
  quickEditPosition: NonNullable<DataTableProperties<any>['quickEditPosition']>
  buttons: {
    quickEdit: JSX.Element
    filter: JSX.Element
    columnPicker: JSX.Element
    refresh: JSX.Element
  }
}

export const TableActionButtons: React.FC<TableActionButtonsProps> = function TableActionButtons({ position, quickEditPosition, buttons }) {
  let showQuickEdit = false;
  if (position === 'top') {
    showQuickEdit = (quickEditPosition === 'top' || quickEditPosition === 'both');
  } else {
    // bottom
    showQuickEdit = (quickEditPosition === 'bottom' || quickEditPosition === 'both');
  }

  return <>
    {position === 'top' && buttons.refresh}
    {showQuickEdit && buttons.quickEdit}
    {position === 'top' && buttons.filter}
    {position === 'top' && buttons.columnPicker}
  </>
}

export interface CustomRefreshButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>
}

interface RefreshButtonProps {
  hideRefetch?: boolean
}

export const TableRefreshButton: React.FC<RefreshButtonProps> = function TableRefreshButton({ hideRefetch }) {
  const { refetch } = useContext(TableDataContext);
  const {
    classNames,
    labels,
    components,
  } = useContext(ColumnContext);

  const onButtonClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    refetch?.();
  }, [ refetch ]);

  if (typeof refetch !== 'function' || hideRefetch) return null;

  let btnSettingsClass: string | undefined;
  if (classNames?.actionButton || classNames?.actionButtonRefresh) {
    btnSettingsClass = `${classNames?.actionButton ?? ''} ${classNames?.actionButtonRefresh ?? ''}`.trim();
  }

  const CustomButton = components?.Buttons?.Refresh;

  return <>
    {!!CustomButton && <CustomButton onClick={onButtonClick} />}
    {!CustomButton && <button type='button' title={labels?.refresh ?? 'Refresh'} className={btnSettingsClass} onClick={onButtonClick}>
      <FontAwesomeIcon icon={faSyncAlt} />
    </button>}
  </>
}
import React from 'react';
import { DataTableProperties } from './types';

export interface TableActionButtonsProps {
  position: 'top' | 'bottom'
  quickEditPosition: NonNullable<DataTableProperties<any>['quickEditPosition']>
  buttons: {
    quickEdit: JSX.Element
    filter: JSX.Element
    columnPicker: JSX.Element
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
    {showQuickEdit && buttons.quickEdit}
    {position === 'top' && buttons.filter}
    {position === 'top' && buttons.columnPicker}
  </>
}
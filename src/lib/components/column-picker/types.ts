import { MouseEventHandler } from 'react';
import { DataColumn } from '../table/types';

export interface CustomColumnPickerButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>
}

export interface ColumnDragSource {
  column: DataColumn<any>
  sourceList: string
}
import { ReactRenderable, Fn, ResolveProps } from '../../types';
import {
  DetailedHTMLProps,
  TableHTMLAttributes,
  HTMLProps
} from 'react';

// type DataFn<T> = (() => T[]) | (() => Promise<T[]>);
// export type EditFn<T> = (row: T, changes: Partial<T>) => Promise<boolean>;

export interface DataTableProperties<T> {
  id: string;
  columns: Partial<DataColumnProp<T>>[];
  data: Fn<T[]> | T[];

  getRowKey?: (row: T) => string | number;

  tableContainerProps?: Omit<HTMLProps<HTMLDivElement>, 'id'>;
  tableWrapperProps?: Omit<HTMLProps<HTMLDivElement>, 'id'>;
  tableProps?: DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
}
// //  React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>
// interface TableContainerProps extends Omit<HTMLProps<HTMLDivElement>, 'id'> {
// }
// let x: TableHTMLAttributes;
// x.

export type FixedType = boolean | 'left' | 'right';

interface ResolvableColumnTypes {
  header: ReactRenderable;
  fixed: FixedType;
  sortable: boolean;
  filterable: boolean;
  enabled: boolean;
  visibleByDefault: boolean;
  canToggleVisibility: boolean;
}

interface BaseColumnProps<T> {
  key: string;
  render?: (value: any, row: T, column: DataColumn<T>) => ReactRenderable;
  accessor?: string | number;
  getValue?: (row: T, column: DataColumn<T>) => any;
  className?: string;
}

/** Provides definition for columns as they are to be passed in */
export interface DataColumnProp<T> extends ResolveProps<ResolvableColumnTypes>, BaseColumnProps<T> {
  columns: Partial<DataColumnProp<T>>[];
}

/** Provides definition for columns internally, as well as passed to interaction functions */
export interface DataColumn<T> extends ResolvableColumnTypes, BaseColumnProps<T> {
  columns?: DataColumn<T>[];

  isVisible: boolean;
  rowDepth: number;
  rowSpan: number;
  colSpan: number;
  offset: number;
}

/**
 * Used for local storage to help remember the visible column changes made by the user
 * and remember them for the next time they refresh the page.
 */
export interface ColumnVisibilityStorage {
  [x: string]: boolean;
}

export interface TableBodyProps {
  data: any[];
  getRowKey?: (row: any) => string | number;
}
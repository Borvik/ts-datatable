import { ReactRenderable, ResolveProps } from '../../types';
import {
  DetailedHTMLProps,
  TableHTMLAttributes,
  HTMLProps
} from 'react';
import { QueryStateOptions, QueryStringFilterTypes } from '../../utils/useQueryState';
import { PaginateRequiredProps, PaginateOptions, PageChange } from '../pagination/types';
import { SearchRequiredProps } from '../search/types';
import { FilterSettings } from '../filter/types';

// export type EditFn<T> = (row: T, changes: Partial<T>) => Promise<boolean>;

export interface DataFnResult<T> {
  data: T;
  total: number;
}

type DataResultUnion<T> = T | DataFnResult<T>;
export type DataFn<T> = (props: {
  pagination: PageChange;
  search?: string;
  filters?: QueryFilterGroup;
  sorts: ColumnSort[];
}) => DataResultUnion<T> | Promise<DataResultUnion<T>>;

export interface DataTableProperties<T> {
  id: string;
  columns: Partial<DataColumnProp<T>>[];
  data: DataFn<T[]> | T[];
  totalCount?: number;

  multiColumnSorts?: boolean;
  defaultSort?: ColumnSort[];

  qs?: QueryStateOptions;

  paginate?: false | 'top' | 'bottom' | 'both';
  paginateOptions?: PaginateOptions;
  hideSearchForm?: boolean;

  getRowKey?: (row: T) => string | number;
  onShowColumnPicker?: OnShowColumnPicker;

  tableContainerProps?: Omit<HTMLProps<HTMLDivElement>, 'id' | 'style'>;
  tableWrapperProps?: Omit<HTMLProps<HTMLDivElement>, 'id' | 'style'>;
  tableProps?: DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;

  fixedColBg?: string;

  filterSettings?: FilterSettings;

  components?: {
    Paginate?: React.ReactType<PaginateRequiredProps>;
    SearchForm?: React.ReactType<SearchRequiredProps>;
    Loading?: ReactRenderable;
  }
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
  defaultSortDir: 'asc' | 'desc';
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
  name?: string; // used for qs filter/sorts
  filter?: ColumnFilter; // defines the filter capabilities
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
type SetColumnVisibilityCallback = (columnVisibility: ColumnVisibilityStorage) => void;
export type OnShowColumnPicker = (columns: DataColumn<any>[], setColumnVisibility: SetColumnVisibilityCallback, btnElement: HTMLButtonElement) => void | Promise<void>;

export interface TableBodyProps {
  data: any[];
  getRowKey?: (row: any) => string | number;
  loading: boolean;
  LoadingComponent?: ReactRenderable;
}

export interface ColumnSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ColumnSorts {
  sort: ColumnSort[];
}

export interface QSColumnSorts {
  sort: string[];
}


interface BaseColumnFilter {
  parseAsType?: QueryStringFilterTypes
  filterKey?: string
  label?: ReactRenderable
}

interface StringColumnFilter extends BaseColumnFilter {
  type: 'string' | 'email';
  operators?: StringOperator[];
  defaultOperator?: StringOperator;
}

interface NumberColumnFilter extends BaseColumnFilter {
  type: 'number';
  operators?: NumberOperator[];
  defaultOperator?: NumberOperator;
}

interface BooleanColumnFilter extends BaseColumnFilter {
  type: 'boolean';
  operators?: BooleanOperator[];
  defaultOperator?: BooleanOperator;
}

export interface CustomColumnFilter extends BaseColumnFilter {
  type: 'custom';
  operators?: AllFilterOperators[];
  defaultOperator?: AllFilterOperators;
  defaultValue?: any;
  toDisplay: (value: any) => ReactRenderable;
  Editor: React.ReactType<CustomEditorProps>;
}

export interface CustomEditorProps {
  inputRef: React.MutableRefObject<HTMLElement | null>;
  focusRef: React.MutableRefObject<HTMLElement | null>;
  value: any;
  allValues: any;
  setValue: (newValue: any) => void;
}

export const StringOperators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'bet', 'nbet', 'con', 'ncon', 'beg', 'end', 'nul', 'nnul', 'any', 'none'] as const;
export const NumberOperators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'bet', 'nbet', 'nul', 'nnul', 'any', 'none'] as const;
export const BooleanOperators = ['eq', 'neq', 'nul', 'nnul'] as const;

type StringOperator = typeof StringOperators[number];
type NumberOperator = typeof NumberOperators[number];
type BooleanOperator = typeof BooleanOperators[number];
export type AllFilterOperators = StringOperator | NumberOperator | BooleanOperator;

export type OperatorMap<U extends string> = {
  [K in U]: ReactRenderable
};

export const OperatorLabels: OperatorMap<AllFilterOperators> = {
  'eq': 'Equals',
  'neq': 'Does not equal',
  'gt': 'Is greater than',
  'gte': 'Is greater than or equal to',
  'lt': 'Is less than',
  'lte': 'Is less than or equal to',
  'bet': 'Is Between',
  'nbet': 'Is not between',
  'con': 'Contains',
  'ncon': 'Does not contain',
  'beg': 'Begins with',
  'end': 'Ends with',
  'nul': 'Is not set',
  'nnul': 'Is set',
  'any': 'Is any of',
  'none': 'Is none of',
};

export const QuickOperatorLabels: OperatorMap<AllFilterOperators> = {
  'eq': '=',
  'neq': '≠',
  'gt': '>',
  'gte': '≥',
  'lt': '<',
  'lte': '≤',
  'bet': 'between',
  'nbet': 'not between',
  'con': 'contains',
  'ncon': 'not contains',
  'beg': 'starts with',
  'end': 'ends with',
  'nul': 'is not set',
  'nnul': 'is set',
  'any': 'is in',
  'none': 'is not in',
}

export type ColumnFilter = StringColumnFilter | NumberColumnFilter | BooleanColumnFilter | CustomColumnFilter;

export interface QueryFilterItem {
  column: string;
  value: any;
  operator: AllFilterOperators;
}

// export interface QueryFilterAndGroup {
//   and: (QueryFilterAndGroup | QueryFilterOrGroup | QueryFilterItem)[];
// }

// export interface QueryFilterOrGroup {
//   or: (QueryFilterAndGroup | QueryFilterOrGroup | QueryFilterItem)[];
// }

// export type QueryFilterGroup = QueryFilterAndGroup | QueryFilterOrGroup;

// export function isFilterAndGroup(value?: QueryFilterGroup | null): value is QueryFilterAndGroup {
//   if (!value) return false;
//   return Array.isArray((value as any).and);
// }

// export function isFilterOrGroup(value?: QueryFilterGroup | null): value is QueryFilterOrGroup {
//   if (!value) return false;
//   return Array.isArray((value as any).and);
// }

export type FilterCollection = (QueryFilterGroup | QueryFilterItem)[];

export interface QueryFilterGroup {
  groupOperator: 'and' | 'or';
  filters: FilterCollection;
}

export function isFilterGroup(value?: QueryFilterGroup | QueryFilterItem | null): value is QueryFilterGroup {
  if (!value) return false;
  return (typeof (value as any).groupOperator === 'string');
}

export function isFilterItem(value?: QueryFilterGroup | QueryFilterItem | null): value is QueryFilterItem {
  if (!value) return false;
  return (typeof (value as any).column === 'string');
}
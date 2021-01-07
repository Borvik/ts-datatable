import { ReactRenderable, ResolveProps } from '../../types';
import {
  DetailedHTMLProps,
  TableHTMLAttributes,
  HTMLProps,
  ReactElement
} from 'react';
import { QueryStateOptions, QueryStringFilterTypes } from '../../utils/useQueryState';
import { PaginateRequiredProps, PaginateOptions, PageChange } from '../pagination/types';
import { SearchRequiredProps } from '../search/types';
import { CustomFilterButtonProps, FilterSettings } from '../filter/types';
import { CustomColumnPickerButtonProps } from '../column-picker/types';
import { TableActionButtonsProps } from './actions';
import { RowSelectorCheckboxProps } from '../row-selector';

// export type EditFn<T> = (row: T, changes: Partial<T>) => Promise<boolean>;

export interface DataFnResult<T> {
  data: T;
  total: number;
}

export interface DataProps {
  pagination: PageChange;
  search?: string;
  filters?: QueryFilterGroup;
  sorts: ColumnSort[];
}

type DataResultUnion<T> = T | DataFnResult<T>;
type DataFnResultUnion<T> = DataResultUnion<T> | ReactElement<any>;
export type DataFnCb<T> = (data: DataResultUnion<T>) => void;
export type DataFn<T> = (props: DataProps, cb: DataFnCb<T>) => DataFnResultUnion<T> | Promise<DataFnResultUnion<T>>;

export interface DataTableProperties<T> {
  id: string;
  columns: Partial<DataColumnProp<T>>[];
  filters?: ColumnFilter[];
  data: DataFn<T[]> | T[];
  totalCount?: number;
  isLoading?: boolean;

  multiColumnSorts?: boolean;
  defaultSort?: ColumnSort[];
  defaultGroupBy?: ColumnSort[];

  qs?: QueryStateOptions;

  paginate?: false | 'top' | 'bottom' | 'both';
  paginateOptions?: PaginateOptions;
  hideSearchForm?: boolean;

  canSelectRows?: boolean;
  canSelectRow?: (row: T) => boolean;
  onSelectionChange?: (selectedIds: any[], selectedRows: T[]) => void;

  getRowKey?: (row: T) => string | number;
  canEditRow?: (row: T) => boolean;
  onQueryChange?: (props: DataProps) => void;
  onShowColumnPicker?: OnShowColumnPicker;
  onShowFilterEditor?: OnShowFilterEditor;
  onSaveQuickEdit?: OnSaveQuickEdit<T>;
  quickEditPosition?: 'top' | 'bottom' | 'both';

  tableContainerProps?: Omit<HTMLProps<HTMLDivElement>, 'id' | 'style'>;
  tableWrapperProps?: Omit<HTMLProps<HTMLDivElement>, 'id' | 'style'>;
  tableProps?: DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;

  fixedColBg?: string;

  filterSettings?: FilterSettings;

  canRowShowDetail?: (row: T) => boolean
  DetailRow?: React.ElementType<{parentRow: T}>;

  canReorderColumns?: boolean
  canGroupBy?: boolean
  groupsExpandedByDefault?: boolean

  components?: CustomComponents

  classNames?: CustomClasses
  labels?: CustomLabels

  suppressFixedWarning?: boolean
}

export interface CustomComponents {
  Paginate?: React.ElementType<PaginateRequiredProps>;
  SearchForm?: React.ElementType<SearchRequiredProps>;
  ActionButtons?: React.ElementType<TableActionButtonsProps>;
  Loading?: ReactRenderable;
  RowCheckbox?: React.ElementType<RowSelectorCheckboxProps>;
  Buttons?: {
    ColumnPicker?: React.ElementType<CustomColumnPickerButtonProps>
    Filter?: React.ElementType<CustomFilterButtonProps>
  }
}

export type FixedType = boolean | 'left' | 'right';

export interface CustomClasses {
  dialogButton?: string
  dialogCloseButton?: string
  dialogApplyButton?: string
  actionButton?: string
  actionButtonEdit?: string
  actionButtonSave?: string
  actionButtonDiscard?: string
  actionButtonFilter?: string
  actionButtonSettings?: string
}

export interface CustomLabels {
  search?: string
  perPage?: string
  page?: string
  pageOf?: string
  first?: string
  previous?: string
  next?: string
  last?: string
  close?: string
  apply?: string
  columns?: string
  settings?: string
  quickEdit?: string
  saveChanges?: string
  discardChanges?: string
  filter?: string
}

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
  isPrimaryKey?: boolean;
  render?: (value: any, row: T, column: DataColumn<T>) => ReactRenderable;
  renderGroup?: (value: any, group: DataGroup<T>, column: DataColumn<T>) => ReactRenderable;
  accessor?: string | number;
  getValue?: (row: T, column: DataColumn<T>) => any;
  className?: string;
  name?: string; // used for qs filter/sorts
  filter?: PartialColumnFilter; // defines the filter capabilities
  editor?: ColumnEditor<T>;
  canEdit?: (row: T, column: DataColumn<T>) => boolean;
}

/** Provides definition for columns as they are to be passed in */
export interface DataColumnProp<T> extends ResolveProps<ResolvableColumnTypes>, BaseColumnProps<T> {
  columns: Partial<DataColumnProp<T>>[];
}

/** Provides definition for columns internally, as well as passed to interaction functions */
export interface DataColumn<T> extends ResolvableColumnTypes, BaseColumnProps<T> {
  columns?: DataColumn<T>[];
  parent?: DataColumn<T>;

  isVisible: boolean;
  rowSpan: number;
  colSpan: number;
  sortIndex: number;
  isGrouped: boolean;
}

/**
 * Used for local storage to help remember the visible column changes made by the user
 * and remember them for the next time they refresh the page.
 */
export interface ColumnVisibilityStorage {
  [x: string]: boolean;
}
type SetColumnConfigCallback = (config: ColumnConfigurationWithGroup) => void;
export type OnShowColumnPicker = (columns: DataColumn<any>[], setColumnConfig: SetColumnConfigCallback, btnElement: HTMLButtonElement) => void | Promise<void>;

export type OnShowFilterEditor = (filter: QueryFilterGroup, applyFilter: (filter: QueryFilterGroup) => void, btnElement: HTMLButtonElement) => void | Promise<void>;

export type SetFilterCb = (newState: QueryFilterGroup | ((state: QueryFilterGroup) => QueryFilterGroup)) => void;
export type SetPaginationCb = (newState: Partial<{ page: number; perPage: number}> | ((state: { page: number; perPage: number}) => Partial<{page: number; perPage: number}>)) => void;

export type QuickEditFormData<T> = Record<PropertyKey, Partial<T>>;
export type OnSaveQuickEdit<T> = (formData: QuickEditFormData<T>) => Promise<void>

export interface ColumnConfiguration {
  visibility: ColumnVisibilityStorage
  columnOrder: string[]
}

export interface ColumnConfigurationWithGroup extends ColumnConfiguration {
  groupBy: ColumnSort[]
}

export interface TableBodyProps {
  data: any[];
  getRowKey?: (row: any) => string | number;
  canEditRow?: (row: any) => boolean;
  loading: boolean;
  LoadingComponent?: ReactRenderable;
}

export interface ColumnSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface GroupSort {
  column: string;
  direction: 'asc' | 'desc' | null;
}

export interface ColumnSorts {
  sort: ColumnSort[];
}

export interface QSColumnSorts {
  sort: string[];
}

export interface GroupBy {
  group: ColumnSort[];
}

export interface QSGroupBy {
  group: string[];
}

export interface DataGroup<T> {
  key: string
  level: number
  column: string
  value: any
  children: DataGroup<T>[] | DataRow[]
  firstRow: T
}

export interface DataRow {
  key: string | number
  rowIndex: number
  row: any
}

export function isDataGroup<T>(value?: DataGroup<T> | DataRow | null): value is DataGroup<T> {
  if (!value) return false;
  return (typeof (value as any).column === 'string');
}

export function isDataRow<T>(value?: DataGroup<T> | DataRow | null): value is DataRow {
  if (!value) return false;
  return (typeof (value as any).column === 'undefined');
}

export function isDataGroupArray<T>(value?: DataGroup<T>[] | DataRow[]): value is DataGroup<T>[] {
  if (!value?.length) return false;
  return (typeof (value[0] as any).column === 'string');
}

export function isDataRowArray<T>(value?: DataGroup<T>[] | DataRow[]): value is DataRow[] {
  if (!value?.length) return false;
  return (typeof (value[0] as any).column === 'undefined');
}

/**
 * 888888 88 88     888888 888888 88""Yb 
 * 88__   88 88       88   88__   88__dP 
 * 88""   88 88  .o   88   88""   88"Yb  
 * 88     88 88ood8   88   888888 88  Yb 
 */

type MandateProps<T extends {}, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
type FKReq<T extends BaseColumnFilter> = MandateProps<T, 'filterKey' | 'label'>

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
  Editor: React.ElementType<CustomFilterEditorProps>;
}

export interface CustomFilterEditorProps {
  inputRef: React.MutableRefObject<HTMLElement | null>;
  focusRef: React.MutableRefObject<HTMLElement | null>;
  value: any;
  allValues: any;
  setValue: (newValue: any) => void;
  onLoseFocus: () => void;
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

export type PartialColumnFilter = StringColumnFilter | NumberColumnFilter | BooleanColumnFilter | CustomColumnFilter;
export type ColumnFilter = FKReq<StringColumnFilter> | FKReq<NumberColumnFilter> | FKReq<BooleanColumnFilter> | FKReq<CustomColumnFilter>;

export interface QueryFilterItem {
  column: string;
  value: any;
  operator: AllFilterOperators;
}

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


/**
 * 888888 8888b.  88 888888  dP"Yb  88""Yb .dP"Y8 
 * 88__    8I  Yb 88   88   dP   Yb 88__dP `Ybo." 
 * 88""    8I  dY 88   88   Yb   dP 88"Yb  o.`Y8b 
 * 888888 8888Y"  88   88    YbodP  88  Yb 8bodP' 
 */

export type EditFormData = Record<PropertyKey, unknown>;

interface BasicColumnEditor {
  type: 'text' | 'email' | 'number' | 'checkbox'
}

export interface CustomColumnEditor<T> {
  type: 'custom'
  Editor: React.ElementType<CustomEditorProps<T>>
}

export interface CustomEditorProps<T> {
  value: any;
  row: T;
  column: DataColumn<T>;
  setValue: (newValue: any) => void;
}

type ColumnEditor<T> = BasicColumnEditor | CustomColumnEditor<T>;

export type InputType = 'text' | 'email' | 'date' | 'datetime-local' | 'month' | 'number' | 'range' | 'search' | 'tel' | 'url' | 'week' | 'password' | 'datetime' | 'time' | 'color';
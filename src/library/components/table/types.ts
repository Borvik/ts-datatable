import { ReactRenderable, ResolveProps } from '../../types';
import React, {
  DetailedHTMLProps,
  TableHTMLAttributes,
  TdHTMLAttributes,
  HTMLAttributes,
  HTMLProps,
  ReactElement
} from 'react';
import { QueryStateOptions } from '@borvik/use-querystate/dist/types';
import { QueryStringFilterTypes } from '@borvik/querystring/dist/types';
import { PaginateRequiredProps, PaginateOptions, PageChange } from '../pagination/types';
import { SearchRequiredProps } from '../search/types';
import { CustomFilterButtonProps, FilterSettings } from '../filter/types';
import { CustomColumnPickerButtonProps } from '../column-picker/types';
import { CustomRefreshButtonProps, TableActionButtonsProps } from './actions';
import { RowSelectorCheckboxProps } from '../row-selector/checkbox';

export type Pagination = { page: number; perPage: number };
// export type EditFn<T> = (row: T, changes: Partial<T>) => Promise<boolean>;
type Unarray<T> = T extends Array<infer U> ? U : T;

export interface DataFnResult<T, FooterData> {
  data: T;
  footerData?: FooterData
  total: number;
  refetch?: () => void;
}

export interface DataProps<T> {
  pagination: PageChange;
  search?: string;
  filters?: QueryFilterGroup;
  sorts: ColumnSort[];
  visibleColumns: DataColumn<T>[];
}

type DataResultUnion<T, FooterData> = T | DataFnResult<T, FooterData>;
type DataFnResultUnion<T, FooterData> = DataResultUnion<T, FooterData> | ReactElement<any>;
export type DataFnCb<T, FooterData> = (data: DataResultUnion<T, FooterData>) => void;
export type DataFn<T, FooterData> = (props: DataProps<Unarray<T>>, cb: DataFnCb<T, FooterData>) => DataFnResultUnion<T, FooterData> | Promise<DataFnResultUnion<T, FooterData>>;

// export type FooterDataFn<T> = (props: DataProps)

export interface DataTableProperties<T, FooterData extends T = T> {
  id: string;
  columns: Partial<DataColumnProp<T>>[];
  filters?: ColumnFilter[];
  data?: DataFn<T[], FooterData[]> | T[];
  totalCount?: number;
  isLoading?: boolean;
  preMDRColumn?: Partial<DataColumnProp<T>>;
  footerData?: FooterData[];
  passColumnsToQuery?: boolean
  fixedHeaders?: boolean
  fixedFooters?: boolean

  multiColumnSorts?: boolean;
  defaultSort?: ColumnSort[];
  defaultGroupBy?: ColumnSort[];
  defaultFilter?: string | Record<string, any>;

  qs?: QueryStateOptions;

  paginate?: false | 'top' | 'bottom' | 'both';
  paginateOptions?: PaginateOptions;
  hideSearchForm?: boolean;

  canSelectRows?: boolean;
  canSelectRow?: (row: T) => boolean;
  onSelectionChange?: (selectedIds: any[], selectedRows: T[]) => void;

  getRowKey?: (row: T) => string | number;
  canEditRow?: (row: T) => boolean;
  onQueryChange?: (props: DataProps<T>) => void;
  onShowColumnPicker?: OnShowColumnPicker;
  onShowFilterEditor?: OnShowFilterEditor;
  onSaveQuickEdit?: OnSaveQuickEdit<T>;
  quickEditPosition?: 'top' | 'bottom' | 'both';
  editMode?: EditModes;
  refetch?: () => void;
  hideRefetch?: boolean
  enableColumnSearch?:boolean

  tableContainerProps?: Omit<HTMLProps<HTMLDivElement>, 'id' | 'style'>;
  tableWrapperProps?: Omit<HTMLProps<HTMLDivElement>, 'id' | 'style'>;
  tableProps?: DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  getTableRowProps?: (row: T) => null | undefined | DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  getTableCellProps?: (value: any, row: T, column: DataColumn<T>) => null | undefined | DetailedHTMLProps<TdHTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement>;

  fixedColBg?: string;

  filterSettings?: FilterSettings;

  canRowShowDetail?: (row: T) => boolean
  DetailRow?: React.ElementType<{parentRow: T}>;

  canReorderColumns?: boolean
  canGroupBy?: boolean
  groupsExpandedByDefault?: boolean

  components?: CustomComponents<T>

  classNames?: CustomClasses
  labels?: CustomLabels

  suppressFixedWarning?: boolean
  doNotUseHTML5Dialog?: boolean
  doNotUseRefetchAfterSave?: boolean
  methodRef?: React.Ref<RefMethods>
}

export interface RefState {
  filter: QueryFilterGroup
  query?: string | null
  sort: ColumnSort[]
  columnConfig: ColumnConfigurationWithGroup
}
export interface RefMethods {
  clearSelection: () => void;
  getState: () => RefState;
  setState: (value: Partial<RefState>) => void;
}

export type EditModes = 'default' | 'show' | 'autosave';

export interface CustomComponents<T> {
  Paginate?: React.ElementType<PaginateRequiredProps>;
  SearchForm?: React.ElementType<SearchRequiredProps>;
  ActionButtons?: React.ElementType<TableActionButtonsProps>;
  DataProvider?: React.ElementType<unknown>;
  Loading?: ReactRenderable;
  RowCheckbox?: React.ElementType<RowSelectorCheckboxProps<T>>;
  TableWrapper?: React.ElementType<HTMLProps<HTMLDivElement>>;
  Buttons?: {
    ColumnPicker?: React.ElementType<CustomColumnPickerButtonProps>
    Filter?: React.ElementType<CustomFilterButtonProps>
    Refresh?: React.ElementType<CustomRefreshButtonProps>
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
  actionButtonRefresh?: string
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
  refresh?: string
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
  render?: (value: any, row: T, column: DataColumn<T>, rowIndex: number) => ReactRenderable;
  renderGroup?: (value: any, group: DataGroup<T>, column: DataColumn<T>) => ReactRenderable;
  renderFooter?: (value: any, row: T, column: DataColumn<T>) => ReactRenderable;
  accessor?: string | number;
  getValue?: (row: T, column: DataColumn<T>) => any;
  className?: string;
  name?: string; // used for qs filter/sorts
  filter?: PartialColumnFilter; // defines the filter capabilities
  editor?: ColumnEditor<T>;
  canEdit?: (row: T, column: DataColumn<T>) => boolean;
  preMDRColumnWidth?: number
  EditorWrapper?: React.ElementType<EditorWrapperProps<T>>
  columnSearch?: ColumnSearch
}

type ColumnSearch = {
  columnSearchOperator: AllFilterOperators
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
export type SetPaginationCb = (newState: Pagination | ((state: Pagination) => Pagination)) => void;

export type QuickEditFormData<T> = Record<PropertyKey, Partial<T>>;
export type OnSaveQuickEdit<T> = (formData: QuickEditFormData<T>, originalData: QuickEditFormData<T>) => Promise<void>

export interface ColumnConfiguration {
  visibility: ColumnVisibilityStorage
  columnOrder: string[]
}

export interface ColumnConfigurationWithGroup extends ColumnConfiguration {
  groupBy: ColumnSort[]
}

export interface TableBodyProps<T> {
  getRowKey?: (row: T) => string | number;
  canEditRow?: (row: T) => boolean;
  LoadingComponent?: ReactRenderable;
}

export interface TableFooterProps<T> {
  data: T[]
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
  children: DataGroup<T>[] | DataRow<T>[]
  firstRow: T
}

export interface DataRow<T> {
  key: string | number
  rowIndex: number
  row: T
}

export function isDataGroup<T>(value?: DataGroup<T> | DataRow<T> | null): value is DataGroup<T> {
  if (!value) return false;
  return (typeof (value as any).column === 'string');
}

export function isDataRow<T>(value?: DataGroup<T> | DataRow<T> | null): value is DataRow<T> {
  if (!value) return false;
  return (typeof (value as any).column === 'undefined');
}

export function isDataGroupArray<T>(value?: DataGroup<T>[] | DataRow<T>[]): value is DataGroup<T>[] {
  if (!value?.length) return false;
  return (typeof (value[0] as any).column === 'string');
}

export function isDataRowArray<T>(value?: DataGroup<T>[] | DataRow<T>[]): value is DataRow<T>[] {
  if (!value?.length) return false;
  return (typeof (value[0] as any).column === 'undefined');
}

export function isValidPreMDRColumn<T>(col?: DataColumn<T>): col is DataColumn<T> {
  return (!!col && typeof col.render === 'function' && typeof col.preMDRColumnWidth === 'number' && !Number.isNaN(col.preMDRColumnWidth) && Number.isFinite(col.preMDRColumnWidth));
}

/**
 * 888888 88 88     888888 888888 88""Yb 
 * 88__   88 88       88   88__   88__dP 
 * 88""   88 88  .o   88   88""   88"Yb  
 * 88     88 88ood8   88   888888 88  Yb 
 */

type MandateProps<T extends {}, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
type FKReq<T extends BaseColumnFilter> = MandateProps<T, 'filterKey' | 'label'>

interface ChosenFilterColumnResult {
  value?: any
  op?: AllFilterOperators
  metadata?: any
}

interface ChosenFilterColumnArgs {
  value: any
  op: AllFilterOperators
  column: DataColumn<any>
  metadata?: any
  isEdit: boolean
}

interface BaseColumnFilter {
  parseAsType?: QueryStringFilterTypes
  filterKey?: string
  label?: ReactRenderable
  metaToDisplay?: string; // path to metadata to display
  onChosen?: (args: ChosenFilterColumnArgs) => Promise<ChosenFilterColumnResult | void | null | undefined>
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
  MultiEditor?: React.ElementType<CustomFilterEditorProps>;
  editorOptions?: any;
}

export interface CustomFilterEditorProps {
  inputRef: React.MutableRefObject<HTMLElement | null>;
  focusRef: React.MutableRefObject<HTMLElement | null>;
  value: any;
  allValues: any;
  setValue: (newValue: any) => void;
  onLoseFocus: () => void;
  editorOptions?: any;
}

export const StringOperators = ['eq', 'ieq', 'neq', 'gt', 'gte', 'lt', 'lte', 'bet', 'nbet', 'con', 'ncon', 'beg', 'end', 'nul', 'nnul', 'any', 'none'] as const;
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
  'ieq': 'Case-insensitive Equals',
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
  'ieq': '≈',
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

export function isCustomFilter(value?: PartialColumnFilter): value is CustomColumnFilter {
  return value?.type === 'custom';
}

export interface QueryFilterItem {
  column: string;
  value: any;
  operator: AllFilterOperators;
  meta?: unknown;
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
  editorOptions?: any
}

export interface CustomEditorProps<T> {
  /**
   * The current value of the cell
   */
  value: any;
  /**
   * An object containing the original data for the row this editor is in
   */
  row: T;
  /**
   * An object containing the all the edit data for the current row
   */
  editData: Partial<T>
  column: DataColumn<T>;
  setValue: (newValue: any) => void;
  setValues: (data: Partial<T>) => void;
  originalValue: any;
  autoSave: () => void;
  editMode: EditModes;
  editorOptions?: any
}

type ColumnEditor<T> = BasicColumnEditor | CustomColumnEditor<T>;

export type InputType = 'text' | 'email' | 'date' | 'datetime-local' | 'month' | 'number' | 'range' | 'search' | 'tel' | 'url' | 'week' | 'password' | 'datetime' | 'time' | 'color';

export interface EditorWrapperProps<T> {
  value: any;
  rawValue: any;
  row: T;
  column: DataColumn<T>;
}
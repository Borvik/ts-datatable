import { createContext } from 'react';
import {
  DataColumn,
  ColumnVisibilityStorage,
  ColumnSorts,
  ColumnSort,
  OnShowColumnPicker,
  QueryFilterGroup,
  EditFormData,
  QuickEditFormData,
  CustomClasses,
  CustomLabels,
  CustomComponents,
  SetFilterCb,
  SetPaginationCb,
  OnShowFilterEditor,
  GroupBy,
} from './types';
import { FilterSettings } from '../filter/types';

interface ColumnContextInterface<T> {
  actualColumns: DataColumn<T>[]; // the flat list of columns (lowest level)
  headerRows: DataColumn<T>[][];
  columnSorts: ColumnSort[];
  groupBy: ColumnSort[]
  filter: QueryFilterGroup,
  filterSettings?: FilterSettings,
  multiColumnSorts: boolean;
  isEditing: boolean;
  isSavingQuickEdit: boolean;
  editData: EditFormData;
  canSelectRows: boolean;
  canGroupBy: boolean;
  selectedRows: Record<string | number, T>;
  setFormData: React.Dispatch<React.SetStateAction<EditFormData>>;
  setColumnVisibility: (newState: (ColumnVisibilityStorage | ((state: ColumnVisibilityStorage) => ColumnVisibilityStorage))) => void;
  setColumnSort: (newState: ColumnSorts | ((state: ColumnSorts) => ColumnSorts)) => void;
  setGroupBy: (newState: GroupBy | ((state: GroupBy) => GroupBy)) => void;
  setAllSelected: (selectAll: boolean) => void;
  setRowSelected: (row: T, rowIndex: number) => void;
  onShowColumnPicker?: OnShowColumnPicker;
  onShowFilterEditor?: OnShowFilterEditor;
  setFilter: SetFilterCb;
  setPagination: SetPaginationCb;
  getRowKey?: (row: T) => string | number
  onSaveQuickEdit: (data: QuickEditFormData<T>) => Promise<void>
  DetailRow?: React.ElementType<{parentRow: T}>
  canRowShowDetail?: (row: T) => boolean
  columnOrder: string[]
  setColumnOrder: (newState: string[] | ((state: string[]) => string[])) => void
  canReorderColumns: boolean
  canSelectRow?: (row: T) => boolean;
  classNames?: CustomClasses
  labels?: CustomLabels
  components?: CustomComponents
  groupsExpandedByDefault: boolean
}

export const ColumnContext = createContext<ColumnContextInterface<any>>({
  actualColumns: [],
  headerRows: [],
  columnSorts: [],
  groupBy: [],
  filter: {groupOperator: 'and', filters: []},
  multiColumnSorts: false,
  isEditing: false,
  isSavingQuickEdit: false,
  editData: {},
  canSelectRows: false,
  selectedRows: {},
  setFormData: () => {},
  setColumnVisibility: () => {},
  setColumnSort: () => {},
  setGroupBy: () => {},
  setAllSelected: () => {},
  setRowSelected: () => {},
  setFilter: () => {},
  setPagination: () => {},
  onSaveQuickEdit: async () => {},
  columnOrder: [],
  setColumnOrder: () => {},
  canReorderColumns: false,
  canGroupBy: false,
  groupsExpandedByDefault: true,
});

interface GroupCollapseContextInterface {
  setExpanded: (groupKey: string, expanded: boolean) => void
  collapsedState: Record<string, boolean>
}

export const GroupCollapseContext = createContext<GroupCollapseContextInterface>({
  setExpanded: () => {},
  collapsedState: {}
});
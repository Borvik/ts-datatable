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
} from './types';
import { FilterSettings } from '../filter/types';

interface ColumnContextInterface<T> {
  actualColumns: DataColumn<T>[]; // the flat list of columns (lowest level)
  headerRows: DataColumn<T>[][];
  columnSorts: ColumnSort[];
  filter: QueryFilterGroup,
  filterSettings?: FilterSettings,
  multiColumnSorts: boolean;
  isEditing: boolean;
  isSavingQuickEdit: boolean;
  editData: EditFormData;
  setFormData: React.Dispatch<React.SetStateAction<EditFormData>>;
  setColumnVisibility: (newState: (ColumnVisibilityStorage | ((state: ColumnVisibilityStorage) => ColumnVisibilityStorage))) => void;
  setColumnSort: (newState: ColumnSorts | ((state: ColumnSorts) => ColumnSorts)) => void;
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
  classNames?: CustomClasses
  labels?: CustomLabels
  components?: CustomComponents
}

export const ColumnContext = createContext<ColumnContextInterface<any>>({
  actualColumns: [],
  headerRows: [],
  columnSorts: [],
  filter: {groupOperator: 'and', filters: []},
  multiColumnSorts: false,
  isEditing: false,
  isSavingQuickEdit: false,
  editData: {},
  setFormData: () => {},
  setColumnVisibility: () => {},
  setColumnSort: () => {},
  setFilter: () => {},
  setPagination: () => {},
  onSaveQuickEdit: async () => {},
  columnOrder: [],
  setColumnOrder: () => {},
  canReorderColumns: false,
});
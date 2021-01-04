import { createContext } from 'react';
import {
  DataColumn,
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
  ColumnConfigurationWithGroup,
  EditModes,
} from './types';
import { FilterSettings } from '../filter/types';

/**
 * When adding to the context - ask:
 * 1. How often will it update?
 * 2. Is it mutable?
 * 3. What will need to re-render with it?
 *  - is it worth causing every cell to re-render?
 */
interface ColumnContextInterface<T> {
  actualColumns: DataColumn<T>[]; // the flat list of columns (lowest level)
  headerRows: DataColumn<T>[][];
  columnSorts: ColumnSort[]; // TODO: Take out?
  groupBy: ColumnSort[] // TODO: Take out?
  filter: QueryFilterGroup, // TODO: Take out?
  filterSettings?: FilterSettings,
  multiColumnSorts: boolean;
  isEditing: boolean;
  isSavingQuickEdit: boolean; // TODO: Take out?
  editData: EditFormData; // TODO: Take out?
  editMode: EditModes;
  canSelectRows: boolean;
  canGroupBy: boolean;
  selectedRows: Record<string | number, T>; // TODO: Take out?
  setFormData: React.Dispatch<React.SetStateAction<EditFormData>>;
  setColumnSort: (newState: ColumnSorts | ((state: ColumnSorts) => ColumnSorts)) => void;
  setAllSelected: (selectAll: boolean) => void; // TODO: Take out?
  setRowSelected: (row: T, rowIndex: number) => void; // TODO: Take out?
  onShowColumnPicker?: OnShowColumnPicker; // TODO: Take out? props - wrap in useCallback for consistent rendering/calling?
  onShowFilterEditor?: OnShowFilterEditor; // TODO: Take out? props - wrap in useCallback for consistent rendering/calling?
  setFilter: SetFilterCb;
  setPagination: SetPaginationCb;
  getRowKey?: (row: T) => string | number // TODO: Take out? props - wrap in useCallback for consistent rendering/calling?
  onSaveQuickEdit: (data: QuickEditFormData<T>) => Promise<void>
  DetailRow?: React.ElementType<{parentRow: T}> // TODO: Take out? props - wrap in useMemo for consistent rendering?
  canRowShowDetail?: (row: T) => boolean // TODO: Take out? props - wrap in useCallback for consistent rendering/calling?
  columnOrder: string[] // TODO: Take out?
  setColumnConfig: (config: ColumnConfigurationWithGroup) => void
  canReorderColumns: boolean
  canSelectRow?: (row: T) => boolean; // TODO: Take out? props - wrap in useCallback for consistent rendering/calling?
  classNames?: CustomClasses // TODO: Take out?
  labels?: CustomLabels // TODO: Take out?
  components?: CustomComponents // TODO: Take out?
  groupsExpandedByDefault: boolean // TODO: Take out?
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
  editMode: 'default',
  canSelectRows: false,
  selectedRows: {},
  setFormData: () => {},
  setColumnSort: () => {},
  setAllSelected: () => {},
  setRowSelected: () => {},
  setFilter: () => {},
  setPagination: () => {},
  onSaveQuickEdit: async () => {},
  columnOrder: [],
  setColumnConfig: () => {},
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
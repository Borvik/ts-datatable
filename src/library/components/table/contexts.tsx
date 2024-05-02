import { createContext as createSelContext } from '@borvik/react-selector-context';
import React, { createContext, DetailedHTMLProps, TdHTMLAttributes, HTMLAttributes } from 'react';
import {
  DataColumn,
  ColumnSorts,
  ColumnSort,
  OnShowColumnPicker,
  QueryFilterGroup,
  EditFormData,
  CustomClasses,
  CustomLabels,
  CustomComponents,
  SetFilterCb,
  SetPaginationCb,
  OnShowFilterEditor,
  ColumnConfigurationWithGroup,
  EditModes,
  OnSaveQuickEdit,
} from './types';
import { FilterSettings } from '../filter/types';

export interface ColumnContextInterface<T> {
  preMDRColumn?: DataColumn<T>;
  actualColumns: DataColumn<T>[]; // the flat list of columns (lowest level)
  filterColumns: DataColumn<T>[]; // contains actualColumns, but also faux columns defined by separate filters prop
  headerRows: DataColumn<T>[][];
  columnSorts: ColumnSort[];
  groupBy: ColumnSort[]
  filter: QueryFilterGroup,
  filterSettings?: FilterSettings,
  multiColumnSorts: boolean;
  
  canSelectRows: boolean;
  canGroupBy: boolean;
  setColumnSort: (newState: ColumnSorts | ((state: ColumnSorts) => ColumnSorts)) => void;
  setAllSelected: (selectAll: boolean, data: T[]) => void;
  setRowSelected: (row: T, rowIndex: number) => void;
  onShowColumnPicker?: OnShowColumnPicker;
  onShowFilterEditor?: OnShowFilterEditor;
  setFilter: SetFilterCb;
  setPagination: SetPaginationCb;
  getRowKey?: (row: T) => string | number
  propOnSaveQuickEdit?: OnSaveQuickEdit<T>
  DetailRow?: React.ElementType<{parentRow: T}>
  canRowShowDetail?: (row: T) => boolean
  columnOrder: string[]
  setColumnConfig: (config: ColumnConfigurationWithGroup) => void
  canReorderColumns: boolean
  canSelectRow?: (row: T) => boolean;
  classNames?: CustomClasses
  labels?: CustomLabels
  components?: CustomComponents<T>
  groupsExpandedByDefault: boolean
  doNotUseHTML5Dialog?: boolean
  doNotUseRefetchAfterSave: boolean
  getTableRowProps?: (row: T) => (DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement> | null | undefined)
  getTableCellProps?: (value: any, row: T, column: DataColumn<T>) => (DetailedHTMLProps<TdHTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement> | null | undefined)
}

export const ColumnContext = createContext<ColumnContextInterface<any>>({
  actualColumns: [],
  filterColumns: [],
  headerRows: [],
  columnSorts: [],
  groupBy: [],
  filter: { groupOperator: 'and', filters: [] },
  multiColumnSorts: false,
  doNotUseRefetchAfterSave: false,

  canSelectRows: false,
  setColumnSort: () => {},
  setAllSelected: () => {},
  setRowSelected: () => {},
  setFilter: () => {},
  setPagination: () => {},
  columnOrder: [],
  setColumnConfig: () => {},
  canReorderColumns: false,
  canGroupBy: false,
  groupsExpandedByDefault: true,
  getTableRowProps: () => undefined,
  getTableCellProps: () => undefined
});

interface GroupCollapseContextInterface {
  setExpanded: (groupKey: string, expanded: boolean) => void
  collapsedState: Record<string, boolean>
}

export const GroupCollapseContext = createContext<GroupCollapseContextInterface>({
  setExpanded: () => {},
  collapsedState: {}
});

export interface TableContextInterface<T> {
  isEditing: boolean;
  isSavingQuickEdit: boolean;
  editData: EditFormData;
  editMode: EditModes;
  selectedRows: Record<string | number, T>;
}

export const TableContext = createSelContext<TableContextInterface<any>>({
  isEditing: false,
  isSavingQuickEdit: false,
  editData: {},
  editMode: 'default',
  selectedRows: {},
});

interface TableContextProviderProps {
  editMode: EditModes
  children?: React.ReactNode
}

export const useTableContexSetter = TableContext.useSetter;
export const useTableSelector = TableContext.useState;
export const TableContextProvider: React.FC<TableContextProviderProps> = ({ editMode, children }) => {
  return (
    <TableContext.Provider initialValue={{
      editMode,
    }}>
      {children}
    </TableContext.Provider>
  );
}
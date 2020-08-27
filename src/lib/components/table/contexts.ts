import { createContext } from 'react';
import {
  DataColumn,
  ColumnVisibilityStorage,
  ColumnSorts,
  ColumnSort,
  OnShowColumnPicker,
  QueryFilterGroup,
} from './types';
import { FilterSettings } from '../filter/types';

interface ColumnContextInterface<T> {
  actualColumns: DataColumn<T>[]; // the flat list of columns (lowest level)
  headerRows: DataColumn<T>[][];
  columnSorts: ColumnSort[];
  filter: QueryFilterGroup,
  filterSettings?: FilterSettings,
  multiColumnSorts: boolean;
  setColumnVisibility: (newState: (ColumnVisibilityStorage | ((state: ColumnVisibilityStorage) => ColumnVisibilityStorage))) => void;
  setColumnSort: (newState: ColumnSorts | ((state: ColumnSorts) => ColumnSorts)) => void;
  onShowColumnPicker?: OnShowColumnPicker;
  setFilter: (newState: QueryFilterGroup | ((state: QueryFilterGroup) => QueryFilterGroup)) => void;
  setPagination: (newState: Partial<{ page: number; perPage: number}> | ((state: { page: number; perPage: number}) => Partial<{page: number; perPage: number}>)) => void
}

export const ColumnContext = createContext<ColumnContextInterface<any>>({
  actualColumns: [],
  headerRows: [],
  columnSorts: [],
  filter: {groupOperator: 'and', filters: []},
  multiColumnSorts: false,
  setColumnVisibility: () => {},
  setColumnSort: () => {},
  setFilter: () => {},
  setPagination: () => {},
});
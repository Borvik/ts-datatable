import { createContext } from 'react';
import { DataColumn, ColumnVisibilityStorage, ColumnSorts, ColumnSort } from './types';

interface ColumnContextInterface<T> {
  actualColumns: DataColumn<T>[]; // the flat list of columns (lowest level)
  headerRows: DataColumn<T>[][];
  columnSorts: ColumnSort[];
  multiColumnSorts: boolean;
  setColumnVisibility: (newState: (ColumnVisibilityStorage | ((state: ColumnVisibilityStorage) => ColumnVisibilityStorage))) => void;
  setColumnSort: (newState: ColumnSorts | ((state: ColumnSorts) => ColumnSorts)) => void;
}

export const ColumnContext = createContext<ColumnContextInterface<any>>({
  actualColumns: [],
  headerRows: [],
  columnSorts: [],
  multiColumnSorts: false,
  setColumnVisibility: () => {},
  setColumnSort: () => {},
});
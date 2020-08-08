import { createContext } from 'react';
import {
  DataColumn,
  ColumnVisibilityStorage,
  ColumnSorts,
  ColumnSort,
  OnShowColumnPicker,
} from './types';

interface ColumnContextInterface<T> {
  actualColumns: DataColumn<T>[]; // the flat list of columns (lowest level)
  headerRows: DataColumn<T>[][];
  columnSorts: ColumnSort[];
  multiColumnSorts: boolean;
  setColumnVisibility: (newState: (ColumnVisibilityStorage | ((state: ColumnVisibilityStorage) => ColumnVisibilityStorage))) => void;
  setColumnSort: (newState: ColumnSorts | ((state: ColumnSorts) => ColumnSorts)) => void;
  onShowColumnPicker?: OnShowColumnPicker;
}

export const ColumnContext = createContext<ColumnContextInterface<any>>({
  actualColumns: [],
  headerRows: [],
  columnSorts: [],
  multiColumnSorts: false,
  setColumnVisibility: () => {},
  setColumnSort: () => {},
});
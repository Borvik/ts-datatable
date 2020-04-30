import { createContext } from 'react';
import { DataColumn, ColumnVisibilityStorage } from './types';

interface ColumnContextInterface<T> {
  actualColumns: DataColumn<T>[]; // the flat list of columns (lowest level)
  headerRows: DataColumn<T>[][];
  setColumnVisibility: (newState: (ColumnVisibilityStorage | ((state: ColumnVisibilityStorage) => ColumnVisibilityStorage))) => void;
}

export const ColumnContext = createContext<ColumnContextInterface<any>>({
  actualColumns: [],
  headerRows: [],
  setColumnVisibility: () => {},
});

interface PaginationContextInterface {
  page: number;
  limit: number;
  setQueryParams: Function;
  setRecordData: Function;
}

export const PaginationContext = createContext<PaginationContextInterface>({
  page: 1,
  limit: 25,
  setQueryParams: () => {},
  setRecordData: () => {},
});
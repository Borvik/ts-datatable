import { DataColumn } from "../components/table/types";
import get from 'lodash/get';

type GetRowKeyCB = (row: any) => string | number;

export function getRowKey(row: any, rowIdx: number, columns: DataColumn<any>[], fn?: GetRowKeyCB): string | number {
  if (typeof fn === 'function') return fn(row);

  let column = columns.find(c => c.isPrimaryKey);
  if (column) {
    return getRowValue(row, column);
  }

  return rowIdx;
}

export function getRowValue(row: any, col: DataColumn<any>) {
  let value = typeof col.accessor !== 'undefined'
    ? get(row, col.accessor)
    : col.getValue!(row, col);

  return value;
}
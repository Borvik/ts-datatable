import { ColumnSort, DataColumn } from "../components/table/types";
import { getRowValue } from "./getRowKey";

export interface GroupKey {
  column: string
  value: any
}

export function getGroupKeys(row: any, groupBy: ColumnSort[], columns: DataColumn<any>[]) {
  let groupKeys: GroupKey[] = [];

  for (let i = 0; i < groupBy.length; i++) {
    let col = columns.find(c => c.name === groupBy[i].column);
    if (!col) {
      groupKeys.push({ column: groupBy[i].column, value: undefined });
    } else {
      let value = getRowValue(row, col);
      groupKeys.push({ column: groupBy[i].column, value });
    }
  }

  return groupKeys;
}

const NUL = String.fromCharCode(0);
const UNIT_SEP = String.fromCharCode(31);

export function getGroupKey(keys: GroupKey[]): string {
  return keys.map(k => {
    let value = JSON.stringify(k.value, (a,b) => b === undefined ? NUL : b);
    return `${k.column}:${value}`;
  })
  .join(UNIT_SEP);
}
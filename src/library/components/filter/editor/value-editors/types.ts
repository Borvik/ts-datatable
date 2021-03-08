import { QueryFilterItem } from "../../../table/types";
import { SetEditorStateFn } from "../../types";

export interface EditorProps {
  filter: QueryFilterItem
  path: number[];
  index: number;
  valuePath: number | null;
  setState: SetEditorStateFn;
  type: string;
}

export function getValue(columnValue: any, valuePath: number | null): any {
  let value = columnValue;
  if (typeof valuePath === 'number') {
    let arrValue = Array.isArray(columnValue) ? columnValue : [columnValue];
    value = arrValue?.[valuePath];
  }
  return value;
}
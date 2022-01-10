import { DataColumn } from "../types";

export interface EditorProps {
  column: DataColumn<any>
  value: any
  row: any
  rowIndex: number
}
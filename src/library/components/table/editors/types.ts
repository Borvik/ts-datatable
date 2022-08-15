import { DataColumn } from "../types";

export interface EditorProps {
  column: DataColumn<any>
  /**
   * The current value of the cell
   */
  value: any
  /**
   * An object containing the original data for the row this editor is in
   */
  row: any
  rowIndex: number
}
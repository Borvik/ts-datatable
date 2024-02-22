import { ColumnSearch } from "../../types"

export interface GenericColumnSearchInputProps {
  value: string | undefined
  accessor: string | number
  columnSearch: ColumnSearch
  onColumnSearchInput: (newValue: string, column: string | number) => void
  onSubmit: () => void
}
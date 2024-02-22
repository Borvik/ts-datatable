import React, { InputHTMLAttributes, FC } from "react";
import { ColumnSearch } from "../../types";
import { TextInput } from "./text-input";
import { SelectInput } from "./select-input";
import { BooleanSelectInput } from "./boolean-select-input";

interface Props {
  value: string | undefined
  onChange: InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>['onChange']
  onBlur: InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>['onBlur']
  columnSearch: ColumnSearch
}

export const ColumnSearchInput: FC<Props> = function ColumnSearchInput(props) {
  const { columnSearch, ...rest } = props;
  if (columnSearch.type === 'string') {
    return <TextInput columnSearch={columnSearch} {...rest} />;
  } else if (columnSearch.type === 'select') {
    return <SelectInput columnSearch={columnSearch} {...rest} />;
  } else if (columnSearch.type === 'boolean') {
    return <BooleanSelectInput columnSearch={columnSearch} {...rest} />;
  }
  return null;
}
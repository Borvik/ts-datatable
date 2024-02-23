import React, { FC } from "react";
import { TextInput } from "./text-input";
import { SelectInput } from "./select-input";
import { BooleanSelectInput } from "./boolean-select-input";
import { GenericColumnSearchInputProps } from "../../types";
import { CustomInput } from "./custom-input";

export const ColumnSearchInput: FC<GenericColumnSearchInputProps> = function ColumnSearchInput(props) {
  const { columnSearch, ...rest } = props;
  if (columnSearch.type === 'string') {
    return <TextInput columnSearch={columnSearch} {...rest} />;
  } else if (columnSearch.type === 'select') {
    return <SelectInput columnSearch={columnSearch} {...rest} />;
  } else if (columnSearch.type === 'boolean') {
    return <BooleanSelectInput columnSearch={columnSearch} {...rest} />;
  } else if (columnSearch.type === 'custom') {
    return <CustomInput columnSearch={columnSearch} {...rest} />;
  }
  return null;
}
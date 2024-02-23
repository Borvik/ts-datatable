import React, { FC, useCallback, ChangeEvent } from "react";
import { GenericColumnSearchInputProps, StringColumnSearch } from "../../types";

interface Props extends GenericColumnSearchInputProps {
  columnSearch: StringColumnSearch
}

export const TextInput: FC<Props> = function TextInput(props) {
  const { value, searchKey, columnSearch, onColumnSearchInput, onSubmit } = props;

  const onColumnSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { target: { value } } = e;
    onColumnSearchInput(value, searchKey);
  }, [onColumnSearchInput, searchKey]);

  return <input
    defaultValue={value}
    onChange={onColumnSearchChange}
    onBlur={() => onSubmit()}
    className={`column-search-string-input ${columnSearch.className ?? ''}`}
  />;
}
import React, { FC, useCallback, ChangeEvent } from "react";
import { GenericColumnSearchInputProps, SelectColumnSearch } from "../../types";

interface Props extends GenericColumnSearchInputProps {
  columnSearch: SelectColumnSearch
}

export const SelectInput: FC<Props> = function SelectInput(props) {
  const { value, columnSearch, searchKey, onColumnSearchInput, onSubmit } = props;

  const onColumnSearchChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const { target: { value } } = e;
    onColumnSearchInput(value, searchKey);
  }, [onColumnSearchInput, searchKey]);

  return <select
    defaultValue={value}
    onChange={onColumnSearchChange}
    onBlur={() => onSubmit()}
    className={`column-search-select-input ${columnSearch.className ?? ''}`}
  >
    <option value="" />
    {columnSearch.options.map((op, i) => (<option key={`${op.value}-${i}`} value={op.value}>{op.display}</option>))}
  </select>;
}
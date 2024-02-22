import React, { FC, useCallback, ChangeEvent } from "react";
import { BooleanColumnSearch, GenericColumnSearchInputProps } from "../../types";

interface Props extends GenericColumnSearchInputProps {
  columnSearch: BooleanColumnSearch
}

export const BooleanSelectInput: FC<Props> = function BooleanSelectInput(props) {
  const { value, accessor, onColumnSearchInput, onSubmit } = props;

  const onColumnSearchChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { target: { value } } = e;
    onColumnSearchInput(value, accessor);
  }, [onColumnSearchInput, accessor]);

  return <select
    defaultValue={value}
    onChange={onColumnSearchChange}
    onBlur={() => onSubmit()}
  >
    <option value="" />
    <option value={'1'}>true</option>
    <option value={'0'}>false</option>
  </select>;
}
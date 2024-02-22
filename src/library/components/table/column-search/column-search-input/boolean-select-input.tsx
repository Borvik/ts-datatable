import React, { InputHTMLAttributes, FC } from "react";
import { BooleanColumnSearch } from "../../types";

interface Props {
  value: string | undefined
  onChange: InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>['onChange']
  onBlur: InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>['onBlur']
  columnSearch: BooleanColumnSearch
}

export const BooleanSelectInput: FC<Props> = function BooleanSelectInput(props) {
  const { value, onChange, onBlur } = props;
  return <select
    defaultValue={value}
    onChange={onChange}
    onBlur={onBlur}
  >
    <option value="" />
    <option value={'1'}>true</option>
    <option value={'0'}>false</option>
  </select>;
}
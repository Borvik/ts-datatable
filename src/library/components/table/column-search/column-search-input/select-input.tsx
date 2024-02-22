import React, { InputHTMLAttributes, FC } from "react";
import { SelectColumnSearch } from "../../types";

interface Props {
  value: string | undefined
  onChange: InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>['onChange']
  onBlur: InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>['onBlur']
  columnSearch: SelectColumnSearch
}

export const SelectInput: FC<Props> = function SelectInput(props) {
  const { value, onChange, onBlur, columnSearch } = props;
  return <select
    defaultValue={value}
    onChange={onChange}
    onBlur={onBlur}
  >
    <option value="" />
    {columnSearch.type === 'select' && columnSearch.options.map((op, i) => (<option key={`${op.value}-${i}`} value={op.value}>{op.display}</option>))}
  </select>;
}
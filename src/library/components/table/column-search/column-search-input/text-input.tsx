import React, { InputHTMLAttributes, FC } from "react";
import { StringColumnSearch } from "../../types";

interface Props {
  value: string | undefined
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange']
  onBlur: InputHTMLAttributes<HTMLInputElement>['onBlur']
  columnSearch: StringColumnSearch
}

export const TextInput: FC<Props> = function TextInput(props) {
  const { value, onChange, onBlur } = props;
  return <input
    defaultValue={value}
    onChange={onChange}
    onBlur={onBlur}
  />;
}
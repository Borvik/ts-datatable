import React, { InputHTMLAttributes, FC } from "react";

interface Props {
  value: string | undefined
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange']
  onBlur: InputHTMLAttributes<HTMLInputElement>['onBlur']
}

export const TextInput: FC<Props> = function TextInput(props) {
  const { value, onChange, onBlur } = props;
  return <input
    value={value ?? ''}
    onChange={onChange}
    onBlur={onBlur}
  />;
}
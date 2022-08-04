import React from 'react';

export interface RowSelectorCheckboxProps<T> {
  checked: boolean
  indeterminate: boolean
  onChange: React.InputHTMLAttributes<HTMLInputElement>['onChange']
  row?: T
}

export const RowSelectorCheckbox = function RowSelectorCheckbox<T>({ indeterminate, checked, onChange }: RowSelectorCheckboxProps<T>) {
  return <input
    type='checkbox'
    ref={(el) => el && (el.indeterminate = indeterminate)}
    checked={checked}
    onChange={onChange}
  />;
}
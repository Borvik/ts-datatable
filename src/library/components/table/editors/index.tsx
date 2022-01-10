import React from 'react';
import { EditorProps } from './types';
import { InputEditor } from './input';
import { BooleanEditor } from './boolean';
import { CustomEditor } from './custom';

export const CellEditor: React.FC<EditorProps> = function CellEditor({ column, value, row, rowIndex }) {
  switch (column.editor!.type) {
    case 'text':
    case 'number':
    case 'email':
      return <InputEditor type={column.editor!.type} column={column} value={value} row={row} rowIndex={rowIndex} />;
    case 'checkbox':
      return <BooleanEditor column={column} value={value} row={row} rowIndex={rowIndex} />;
    case 'custom':
      return <CustomEditor column={column} value={value} row={row} rowIndex={rowIndex} />;
    default:
      let rendered = typeof column.render !== 'undefined'
        ? column.render(value, row, column, rowIndex)
        : value;
      return <>{rendered}</>;
  }
}
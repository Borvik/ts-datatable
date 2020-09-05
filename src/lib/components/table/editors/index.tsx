import React from 'react';
import { EditorProps } from './types';
import { InputEditor } from './input';
import { BooleanEditor } from './boolean';
import { CustomEditor } from './custom';

export const CellEditor: React.FC<EditorProps> = ({ column, value, row }) => {
  switch (column.editor!.type) {
    case 'text':
    case 'number':
    case 'email':
      return <InputEditor type={column.editor!.type} column={column} value={value} row={row} />;
    case 'checkbox':
      return <BooleanEditor column={column} value={value} row={row} />;
    case 'custom':
      return <CustomEditor column={column} value={value} row={row} />;
    default:
      let rendered = typeof column.render !== 'undefined'
        ? column.render(value, row, column)
        : value;
      return <>{rendered}</>;
  }
}
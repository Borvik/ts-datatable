import React, { useContext } from 'react';
import { TableBodyProps } from './types';
import { ColumnContext } from './contexts';
import get from 'lodash/get';

export const TableBody: React.FC<TableBodyProps> = (props) => {
  const { actualColumns: columns } = useContext(ColumnContext);

  return (
    <tbody>
      {props.data.map((row, rowIdx) => {
        let rowKey = typeof props.getRowKey === 'function'
          ? props.getRowKey(row)
          : rowIdx;

        return (
          <tr key={rowKey}>
            {columns.map((col, colIdx) => {
              if (!col.isVisible) return null;

              let value = typeof col.accessor !== 'undefined'
                ? get(row, col.accessor)
                : col.getValue!(row, col);

              let rendered = typeof col.render !== 'undefined'
                ? col.render(value, row, col)
                : value;

              return <td key={colIdx}>{rendered}</td>;
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
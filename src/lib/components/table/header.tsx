import React, { useContext } from 'react';
import { ColumnContext } from './contexts';
import { HeaderSort } from './sortable';

export const TableHeader: React.FC = () => {
  const { headerRows } = useContext(ColumnContext);

  if (headerRows.length < 1) return null;

  return (
    <thead>
      {headerRows.map((row, rowIdx) => (
        <tr key={rowIdx} className='ts-datatable-header-row'>
          {row.map((col, colIdx) => {
            if (!col) return null;

            let colScope = col.colSpan > 1 ? 'colgroup' : 'col';
            return (
              <th key={colIdx} className={`${col.className ?? ''} ${col.fixed ? `fixed fixed-${col.fixed}` : ''}`.trim()} colSpan={col.colSpan > 1 ? col.colSpan : undefined} rowSpan={col.rowSpan > 1 ? col.rowSpan : undefined} scope={colScope}>
                <span className='ts-datatable-header-cell'>
                  <span className='ts-datatable-header-content'>{col.header}</span>
                  <HeaderSort column={col} />
                </span>
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  );
};
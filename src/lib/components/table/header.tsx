import React, { useContext } from 'react';
import { ColumnContext } from './contexts';
import { HeaderSort } from './sortable';
import { ColumnSort } from './types';

export const TableHeader: React.FC = () => {
  const { headerRows, columnSorts, multiColumnSorts, setColumnSort } = useContext(ColumnContext);

  if (headerRows.length < 1) return null;

  return (
    <thead>
      {headerRows.map((row, rowIdx) => (
        <tr key={rowIdx} className='ts-datatable-header-row'>
          {row.map((col, colIdx) => {
            if (!col) return null;

            let colScope = col.colSpan > 1 ? 'colgroup' : 'col';
            const isSortable = (col.sortable && col.colSpan === 1 && col.name);
            const sort = columnSorts.find(s => s.column === col.name);

            function onClick(e: React.MouseEvent<HTMLSpanElement>) {
              let newSort: ColumnSort = sort
                ? {...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
                : {column: col.name!, direction: col.defaultSortDir};

              if (multiColumnSorts && e.shiftKey) {
                if (sort) {
                  setColumnSort(state => ({
                    sort: state.sort.map(s => {
                      if (sort.column === s.column)
                        return newSort;
                      return s;
                    })
                  }));
                } else {
                  setColumnSort(state => ({
                    sort: [
                      ...state.sort,
                      newSort
                    ]
                  }));
                }
              } else {
                setColumnSort({ sort: [ newSort ] });
              }
            }

            return (
              <th key={colIdx} className={`${col.className ?? ''} ${col.fixed ? `fixed fixed-${col.fixed}` : ''}`.trim()} colSpan={col.colSpan > 1 ? col.colSpan : undefined} rowSpan={col.rowSpan > 1 ? col.rowSpan : undefined} scope={colScope}>
                <span className={`ts-datatable-header-cell ${isSortable ? 'sortable' : ''}`.trim()} onClick={isSortable ? onClick : undefined} onMouseDown={isSortable ? (e) => { if (e.shiftKey) { e.preventDefault() } } : undefined}>
                  <span className='ts-datatable-header-content'>{col.header}</span>
                  <HeaderSort column={col} sort={sort} />
                </span>
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  );
};
import React, { useContext } from 'react';
import { doSetColumnSort } from '../../utils/setColumnSort';
import { RowSelector } from '../row-selector';
import { ColumnContext } from './contexts';
import { HeaderSort } from './sortable';
import { ColumnSort, isValidPreMDRColumn } from './types';

interface HeadProps {
  headRef: React.RefObject<HTMLTableSectionElement>
  data: any[]
}

export const TableHeader: React.FC<HeadProps> = function TableHeader(props) {
  const {
    headerRows,
    columnSorts,
    multiColumnSorts,
    setColumnSort,
    DetailRow,
    canSelectRows,
    groupBy,
    preMDRColumn,
  } = useContext(ColumnContext);

  if (headerRows.length < 1) return null;

  let hasDetailRenderer = (!!DetailRow);

  let indentStyle: any = {'--indent': groupBy.length};
  return (
    <thead ref={props.headRef}>
      {headerRows.map((row, rowIdx) => (
        <tr key={rowIdx} className='ts-datatable-header-row'>
          {row.map((col, colIdx) => {
            if (!col.isVisible) return null;

            let colScope = col.colSpan > 1 ? 'colgroup' : 'col';
            const isSortable = (col.sortable && col.colSpan === 1 && col.name);
            const sort = columnSorts.find(s => s.column === col.name);

            function onClick(e: React.MouseEvent<HTMLSpanElement>) {
              let newSort: ColumnSort = sort
                ? {...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
                : {column: col.name!, direction: col.defaultSortDir};

              doSetColumnSort(setColumnSort, newSort, e.shiftKey, multiColumnSorts);
            }

            return (<React.Fragment key={`row-key-${colIdx}`}>
              {(colIdx === 0 && rowIdx === 0) && <>
                {isValidPreMDRColumn(preMDRColumn) && <th scope='col' style={indentStyle} key='premdr' rowSpan={headerRows.length} className={`fixed fixed-left premdr-col ${preMDRColumn.className ?? ''}`.trim()}><span className='ts-datatable-header-cell'></span></th>}
                {hasDetailRenderer && <th scope='col' style={indentStyle} key='mdr' rowSpan={headerRows.length} className='fixed fixed-left mdr-control'><span className='ts-datatable-header-cell'></span></th>}
                {canSelectRows && <th scope='col' style={indentStyle} key='sel' rowSpan={headerRows.length} className='fixed fixed-left row-selector'>
                  <span className='ts-datatable-header-cell'>
                    <RowSelector
                      row={null}
                      rowIndex={-1}
                      data={props.data}
                    />
                  </span>
                </th>}
              </>}
              <th key={colIdx} style={colIdx === 0 ? indentStyle : undefined} className={`${col.className ?? ''} ${col.fixed ? `fixed fixed-${col.fixed}` : ''}`.trim()} colSpan={col.colSpan > 1 ? col.colSpan : undefined} rowSpan={col.rowSpan > 1 ? col.rowSpan : undefined} scope={colScope}>
                <span className={`ts-datatable-header-cell ${isSortable ? 'sortable' : ''}`.trim()} onClick={isSortable ? onClick : undefined} onMouseDown={isSortable ? (e) => { if (e.shiftKey) { e.preventDefault() } } : undefined}>
                  <span className='ts-datatable-header-content'>{col.header}</span>
                  <HeaderSort column={col} sort={sort} />
                </span>
              </th>
            </React.Fragment>)
          })}
        </tr>
      ))}
    </thead>
  );
};
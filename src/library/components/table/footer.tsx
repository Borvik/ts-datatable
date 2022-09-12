import React, { DetailedHTMLProps, TdHTMLAttributes, useContext } from 'react';
import { getRowValue } from '../../utils/getRowKey';
import { useArrayDerivedState } from '../../utils/useDerivedState';
import { ColumnContext } from './contexts';
import { TableDataContext } from './data-provider';
import { isValidPreMDRColumn, TableFooterProps } from './types';

interface TableFooterRowProps<T> {
  row: T
}

const TableFooterRow = function TableFooterRow<T>({ row }: TableFooterRowProps<T>) {
  const {
    actualColumns: columns,
    DetailRow,
    canSelectRows,
    getTableCellProps,
    preMDRColumn,
  } = useContext(ColumnContext);

  let hasDetailRenderer = (!!DetailRow);

  return <>
    <tr>
      {isValidPreMDRColumn(preMDRColumn) && <td key='premdr' className={`fixed fixed-left premdr-col ${preMDRColumn.className ?? ''}`.trim()}></td>}
      {hasDetailRenderer && <td key={`mdr`} className='fixed fixed-left mdr-control'></td>}
      {canSelectRows && <td key={`sel`} className='fixed fixed-left row-selector'></td>}
      {columns.map((col) => {
        if (!col.isVisible || col.isGrouped) return null;

        let value = getRowValue(row, col);

        let rendered: any = typeof col.renderFooter !== 'undefined'
          ? col.renderFooter(value, row, col)
          : value;

        let classNames: string[] = [col.className ?? '', col.fixed ? `fixed fixed-${col.fixed}` : ''];
        let cellProps: DetailedHTMLProps<TdHTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement> = {};

        if (getTableCellProps && typeof getTableCellProps === 'function'){
          cellProps = getTableCellProps(value, row, col) ?? {}

          if (cellProps.className) {
            classNames.push(cellProps.className)
          }
          classNames = classNames.filter(s => !!s);
        }
        cellProps.className = classNames.join(' ').trim();
        return <td {...cellProps} key={col.key}>{rendered}</td>;
      })}
    </tr>
  </>;
};

export const TableFooter = function TableFooter({}) {
  const { footerData } = useContext(TableDataContext);
  if (!footerData?.length) return null;
  return <TFooter data={footerData} />
}

const TFooter = function TFooter<T>({ data }: TableFooterProps<T>) {
  const { actualColumns: columns, groupBy } = useContext(ColumnContext);
  
  let [footerData] = useArrayDerivedState(() => {
    return data.map((row, rowIndex) => ({
      row,
      rowIndex,
      key: rowIndex,
    }));
  }, [columns, data]);

  return (
    <tfoot>
      {footerData.map(row => <TableFooterRow
        key={row.key}
        row={row.row}
      />)}
    </tfoot>
  )
}
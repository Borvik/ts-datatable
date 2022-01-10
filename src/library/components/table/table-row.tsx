import React, { useContext, useState } from 'react';
import { ColumnContext } from './contexts';
import { getRowValue } from '../../utils/getRowKey';
import { CellEditor } from './editors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { RowSelector } from '../row-selector';
import { DataGroup, isValidPreMDRColumn } from './types';
import { DetailedHTMLProps, HTMLAttributes, TdHTMLAttributes } from 'react';

interface TableRowProps<T> {
  row: T;
  rowIndex: number;
  canEditRow?: (row: T) => boolean;
  group?: DataGroup<T>
}

export const TableRow = function TableRow<T>({ row, group, ...props }: TableRowProps<T>) {
  const [ isExpanded, setExpanded ] = useState(false);
  const {
    actualColumns: columns,
    isEditing,
    editMode,
    DetailRow,
    canRowShowDetail,
    canSelectRows,
    getTableRowProps,
    getTableCellProps,
    preMDRColumn,
  } = useContext(ColumnContext);

  let canEditRow = (isEditing || editMode !== 'default');
  if (canEditRow && typeof props.canEditRow === 'function')
    canEditRow = props.canEditRow(row);

  let columnCount = 0;
  let hasDetailRenderer = (!!DetailRow);
  let detailRowAvailable = hasDetailRenderer;
  if (detailRowAvailable && typeof canRowShowDetail === 'function')
    detailRowAvailable = canRowShowDetail(row);

  const DetailRowRenderer = DetailRow ?? FakeDetailRow;

  let rowStyle: any = {'--indent': group?.level ?? 0};
  let rowProps: DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement> = {};
  
  if (getTableRowProps && typeof getTableRowProps === 'function'){
    rowProps = getTableRowProps(row) ?? {};

    if (rowProps.style) {
      rowProps.style = {...rowProps.style, ...rowStyle};
    } else {
      rowProps.style = rowStyle;
    }
  }
  
  return <>
    <tr {...rowProps}>
      {isValidPreMDRColumn(preMDRColumn) && <td key='premdr' className={`fixed fixed-left premdr-col ${preMDRColumn.className ?? ''}`.trim()}>
        <div className='premdr-col-content'>{preMDRColumn.render?.(null, row, preMDRColumn, props.rowIndex) ?? ''}</div>
      </td>}
      {hasDetailRenderer && <td key={`mdr`} className='fixed fixed-left mdr-control'>
        {detailRowAvailable && <>
          <button type='button' className='mdr-button' onClick={() => setExpanded(v => !v)}>
            <FontAwesomeIcon fixedWidth icon={isExpanded ? faChevronDown : faChevronRight} />
          </button>
        </>}
      </td>}
      {canSelectRows && <td key={`sel`} className='fixed fixed-left row-selector'>
        <RowSelector<T> row={row} rowIndex={props.rowIndex} />
      </td>}
      {columns.map((col, colIdx) => {
        if (!col.isVisible || col.isGrouped) return null;
        columnCount++;

        let value = getRowValue(row, col);

        let rendered: any = null;

        if ((isEditing || editMode !== 'default') && col.editor) {
          let canEdit: boolean = canEditRow;
          if (canEditRow && typeof col.canEdit === 'function')
            canEdit = col.canEdit(row, col);

          if (canEdit) {
            rendered = <CellEditor column={col} value={value} row={row} rowIndex={props.rowIndex} />
            if (col.EditorWrapper) {
              let renderValue = typeof col.render !== 'undefined'
                ? col.render(value, row, col, props.rowIndex)
                : value;

              const Wrapper = col.EditorWrapper;
              rendered = <Wrapper value={renderValue} rawValue={value} row={row} column={col}>{rendered}</Wrapper>; 
            }
          }
        }

        if (rendered === null) {
          rendered = typeof col.render !== 'undefined'
            ? col.render(value, row, col, props.rowIndex)
            : value;
        }

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
        
        return <td {...cellProps} key={colIdx}>{rendered}</td>;
      })}
    </tr>
    {isExpanded && !!DetailRow && <tr>
      {hasDetailRenderer && <td className='fixed fixed-left mdr-control'></td>}
      {canSelectRows && <td className='fixed fixed-left row-selector'></td>}
      <td colSpan={columnCount}><DetailRowRenderer parentRow={row} /></td>
    </tr>}
  </>;
}

const FakeDetailRow: React.FC<{parentRow: any}> = () => {
  return <></>;
}
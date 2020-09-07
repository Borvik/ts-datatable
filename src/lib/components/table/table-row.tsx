import React, { useContext, useState } from 'react';
import { ColumnContext } from './contexts';
import { getRowValue } from '../../utils/getRowKey';
import { CellEditor } from './editors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';

interface TableRowProps {
  row: any;
  canEditRow?: (row: any) => boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ row, ...props }) => {
  const [ isExpanded, setExpanded ] = useState(false);
  const { actualColumns: columns, isEditing, DetailRow, renderDetailRow, canRowShowDetail } = useContext(ColumnContext);

  let canEditRow = isEditing;
  if (canEditRow && typeof props.canEditRow === 'function')
    canEditRow = props.canEditRow(row);

  let columnCount = 0;
  let hasDetailRenderer = (!!DetailRow || !!renderDetailRow);
  let detailRowAvailable = hasDetailRenderer;
  if (detailRowAvailable && typeof canRowShowDetail === 'function')
    detailRowAvailable = canRowShowDetail(row);

  let detailRow: any = null;
  if (isExpanded && hasDetailRenderer) {
    if (typeof renderDetailRow === 'function')
      detailRow = renderDetailRow(row);
    else if (typeof DetailRow !== 'undefined')
      detailRow = <DetailRow parentRow={row} />
  }

  let detailBtnRendered: boolean = false;
  return <>
    <tr>
      {columns.map((col, colIdx) => {
        if (!col.isVisible) return null;
        columnCount++;

        let value = getRowValue(row, col);

        let rendered: any = null;

        if (isEditing && col.editor) {
          let canEdit: boolean = canEditRow;
          if (canEditRow && typeof col.canEdit === 'function')
            canEdit = col.canEdit(row, col);

          if (canEdit)
            rendered = <CellEditor column={col} value={value} row={row} />
        }

        if (rendered === null) {
          rendered = typeof col.render !== 'undefined'
            ? col.render(value, row, col)
            : value;
        }

        let classNames: string[] = [
          col.className ?? '',
          col.fixed ? `fixed fixed-${col.fixed}` : '',
          hasDetailRenderer && !detailBtnRendered ? 'mdr-control' : '',
        ].filter(s => !!s);

        return <td key={colIdx} className={classNames.join(' ').trim()}>
          {detailRowAvailable && !detailBtnRendered && <>
            <button type='button' className='mdr-button' onClick={() => setExpanded(v => !v)}>
              <FontAwesomeIcon fixedWidth icon={isExpanded ? faChevronDown : faChevronRight} />
            </button>
            {detailBtnRendered = true}{/* shouldn't render as its a bool value */}
          </>}
          {!detailRowAvailable && hasDetailRenderer && !detailBtnRendered && <>
            {/* Detail not available for row, but is for table */}
            {/* Need spacing so it doesn't appear mis-aligned */}
            <button type='button' className='mdr-button no-mdr-padding' />
            {detailBtnRendered = true}{/* shouldn't render as its a bool value */}
          </>}
          {rendered}
        </td>;
      })}
    </tr>
    {isExpanded && <tr>
      <td colSpan={columnCount}>{detailRow}</td>
    </tr>}
  </>;
}
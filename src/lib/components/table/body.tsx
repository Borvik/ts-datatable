import React, { useContext, useRef } from 'react';
import { TableBodyProps } from './types';
import { ColumnContext } from './contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import { getRowValue, getRowKey } from '../../utils/getRowKey';

export const TableBody: React.FC<TableBodyProps> = (props) => {
  const { actualColumns: columns } = useContext(ColumnContext);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  return (
    <>
      <tbody ref={tbodyRef} className={`${!props.data.length && props.loading ? 'ts-loading' : ''}`}>
        {props.data.map((row, rowIdx) => {
          let rowKey = getRowKey(row, rowIdx, columns, props.getRowKey);

          return (
            <tr key={rowKey}>
              {columns.map((col, colIdx) => {
                if (!col.isVisible) return null;

                let value = getRowValue(row, col);

                let rendered = typeof col.render !== 'undefined'
                  ? col.render(value, row, col)
                  : value;

                return <td key={colIdx} className={`${col.className ?? ''} ${col.fixed ? `fixed fixed-${col.fixed}` : ''}`.trim()}>{rendered}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
      {props.loading && <tbody className='ts-datatable-loader' ref={(el) => {
        const tbodyEl = tbodyRef.current;
        if (tbodyEl && el) {
          // find wrapper
          const tableEl = tbodyEl.parentElement;
          const theadEl = tableEl!.querySelector('thead');
          const wrapperEl = tableEl!.parentElement;
          
          const tbodyPos = tbodyEl.getBoundingClientRect();
          const theadPos = theadEl!.getBoundingClientRect();
          const wrapperPos = wrapperEl!.getBoundingClientRect();

          el.style.left = wrapperPos.left + 'px';
          // el.style.right = wrapperPos.right + 'px';
          el.style.top = tbodyPos.top + 'px';
          // el.style.bottom = wrapperPos.bottom + 'px';
          el.style.width = wrapperPos.width + 'px';
          el.style.height = (wrapperPos.height - theadPos.height) + 'px';
          el.style.fontSize = Math.min(((wrapperPos.height - theadPos.height) * .7), wrapperPos.width * .7) + 'px';
        }
      }}>
        <tr>
          <td colSpan={columns.length}>
            {props.LoadingComponent ?? <FontAwesomeIcon icon={faCircleNotch} spin />}
          </td>
        </tr>
      </tbody>}
    </>
  );
}
import React, { useContext, useRef } from 'react';
import { DataColumn, DataGroup, DataRow, isDataRowArray, TableBodyProps } from './types';
import { ColumnContext } from './contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import { TableRow } from './table-row';
import { getRowKey } from '../../utils/getRowKey';
import { useArrayDerivedState } from '../../utils/useDerivedState';

export const TableBody: React.FC<TableBodyProps> = ({ data, loading, canEditRow, LoadingComponent, ...props }) => {
  const { actualColumns: columns, groupBy } = useContext(ColumnContext);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  let [groupedData] = useArrayDerivedState(() => {
    if (!groupBy.length) {
      return data.map<DataRow>((row, rowIndex) => ({
        row,
        rowIndex,
        key: getRowKey(row, rowIndex, columns, props.getRowKey),
      }));
    }

    for (let i = 0; i < data.length; i++) {
      // get group values as a array
      // groupBy: [{column: 'a', direction: 'asc'}, {column: 'b', direction: 'asc}]
      // values: [2, 4]

      // build group hierarchy - incrementally
      // store in 2 lists, 1 hierarchical, 1 flat
      // each group should have a unique key to find in flat array
      //   helps actullay build the hierarchical
      // final group in chain gets a `DataRow` for this interation
    }
  }, [columns, groupBy, data]);

  return (
    <>
      <tbody ref={tbodyRef} className={`${!data.length && loading ? 'ts-loading' : ''}`}>
        {/* {data.map((row, rowIdx) => {
          let rowKey = getRowKey(row, rowIdx, columns, props.getRowKey);
          
          return <TableRow
            key={rowKey}
            rowIndex={rowIdx}
            row={row}
            canEditRow={canEditRow}
          />;
        })} */}
        {isDataRowArray(groupedData) && <>
          {groupedData.map(row => <TableRow
            key={row.key}
            rowIndex={row.rowIndex}
            row={row.row}
            canEditRow={canEditRow}
          />)}
        </>}
      </tbody>
      {loading && <tbody className='ts-datatable-loader' ref={(el) => {
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
            {LoadingComponent ?? <FontAwesomeIcon icon={faCircleNotch} spin />}
          </td>
        </tr>
      </tbody>}
    </>
  );
}
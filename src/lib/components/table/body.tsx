import React, { useContext, useRef, useState } from 'react';
import { DataGroup, DataRow, isDataGroupArray, isDataRowArray, TableBodyProps } from './types';
import { ColumnContext, GroupCollapseContext } from './contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import { TableRow } from './table-row';
import { getRowKey } from '../../utils/getRowKey';
import { useArrayDerivedState } from '../../utils/useDerivedState';
import { getGroupKey, getGroupKeys, GroupKey } from '../../utils/getGroupKey';
import { TableGroup } from './table-group';
import { update } from '../../utils/immutable';

export const TableBody: React.FC<TableBodyProps> = ({ data, loading, canEditRow, LoadingComponent, ...props }) => {
  const { actualColumns: columns, groupByOrder } = useContext(ColumnContext);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  let [groupedData] = useArrayDerivedState(() => {
    if (!groupByOrder.length) {
      return data.map<DataRow>((row, rowIndex) => ({
        row,
        rowIndex,
        key: getRowKey(row, rowIndex, columns, props.getRowKey),
      }));
    }

    let nestedGroups: DataGroup[] = [];
    for (let i = 0; i < data.length; i++) {
      // get group values as a array
      let groupValues = getGroupKeys(data[i], groupByOrder, columns);

      let currentGroup: GroupKey[] = [],
          currentGroupKey: string,
          lastGroup: DataGroup | null = null;
      while (groupValues.length) {
        let grp = groupValues.shift()!;
        currentGroup.push(grp);
        currentGroupKey = getGroupKey(currentGroup);

        let grpContainer: DataGroup[] = (lastGroup?.children as DataGroup[] | undefined) ?? nestedGroups;
        
        // eslint (no-loop-func)
        // eslint-disable-next-line
        let dgrp = grpContainer.find(g => g.key === currentGroupKey);
        if (!dgrp) {
          dgrp = {
            key: currentGroupKey,
            level: currentGroup.length,
            column: grp.column,
            value: grp.value,
            children: [],
          };
          grpContainer.push(dgrp);
        }
        lastGroup = dgrp;
      }

      (lastGroup!.children as DataRow[]).push({
        row: data[i],
        rowIndex: i,
        key: getRowKey(data[i], i, columns, props.getRowKey),
      });
    }
    return nestedGroups;
  }, [columns, groupByOrder, data]);

  let [groupCollapsed, setGroupCollapsed] = useState<Record<string, boolean>>({});
  function setGroupExpanded(groupKey: string, expanded: boolean) {
    setGroupCollapsed(state => update(state, { [groupKey]: { $set: expanded } }));
  }

  return (
    <>
      <GroupCollapseContext.Provider value={{ collapsedState: groupCollapsed, setExpanded: setGroupExpanded }}>
        <tbody ref={tbodyRef} className={`${!data.length && loading ? 'ts-loading' : ''}`}>
          {isDataGroupArray(groupedData) && <>
            {groupedData.map(grp => <TableGroup
              key={grp.key}
              group={grp}
              canEditRow={canEditRow}
            />)}
          </>}
          {isDataRowArray(groupedData) && <>
            {groupedData.map(row => <TableRow
              key={row.key}
              rowIndex={row.rowIndex}
              row={row.row}
              canEditRow={canEditRow}
            />)}
          </>}
        </tbody>
      </GroupCollapseContext.Provider>
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
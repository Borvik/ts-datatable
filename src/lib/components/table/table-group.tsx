import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext } from 'react';
import { ColumnContext, GroupCollapseContext } from './contexts';
import { TableRow } from './table-row';
import { DataGroup, isDataGroupArray, isDataRowArray } from './types';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';

interface TableGroupProps {
  group: DataGroup
  canEditRow?: (row: any) => boolean
}

export const TableGroup: React.FC<TableGroupProps> = ({ group, canEditRow }) => {
  const {
    actualColumns: columns,
    canSelectRows,
    DetailRow,
    groupsExpandedByDefault,
  } = useContext(ColumnContext);
  const { collapsedState, setExpanded } = useContext(GroupCollapseContext);

  const isExpanded = collapsedState[group.key] ?? groupsExpandedByDefault;

  let columnCount = columns.reduce((v,c) => (c.isVisible && !c.isGrouped) ? v + 1 : v, 0);
  let hasDetailRenderer = (!!DetailRow);
  if (hasDetailRenderer) columnCount++;
  if (canSelectRows) columnCount++;

  let groupColumn = columns.find(c => c.name === group.column);

  let groupStyle: any = {'--indent': group.level - 1};
  return <>
    {!!groupColumn && <tr style={groupStyle}>
      <th className='row-group'>
        <div className='row-group-container'>
          <button type='button' className='mdr-button' onClick={() => setExpanded(group.key, !isExpanded)}>
            <FontAwesomeIcon fixedWidth icon={isExpanded ? faChevronDown : faChevronRight} />
          </button>
          <div className='group-column-name'>{groupColumn.header}</div>
          <div className='group-column-value'>
            {typeof groupColumn.render !== 'undefined' ? groupColumn.render(group.value, null, groupColumn) : group.value}
          </div>
        </div>
      </th>
      {columnCount > 1 && <th colSpan={columnCount - 1}></th>}
    </tr>}
    {isExpanded && <>
      {isDataGroupArray(group.children) && <>
        {group.children.map(g => <TableGroup
          key={g.key}
          group={g}
          canEditRow={canEditRow}
        />)}
      </>}
      {isDataRowArray(group.children) && <>
        {group.children.map(row => <TableRow
          key={row.key}
          rowIndex={row.rowIndex}
          row={row.row}
          canEditRow={canEditRow}
          group={group}
        />)}
      </>}
    </>}
  </>
}
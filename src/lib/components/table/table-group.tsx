import React from 'react';
import { TableRow } from './table-row';
import { DataGroup, isDataGroupArray, isDataRowArray } from './types';

interface TableGroupProps {
  group: DataGroup
  canEditRow?: (row: any) => boolean
}

export const TableGroup: React.FC<TableGroupProps> = ({ group, canEditRow }) => {
  // const [ isExpanded, setExpanded ] = useState(true);

  return <>
    <tr>
      <td></td>
    </tr>
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
      />)}
    </>}
  </>
}
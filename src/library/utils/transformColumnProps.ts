import { DataColumnProp, DataColumn, ColumnVisibilityStorage, ColumnSort } from '../components/table/types';
import { resolve } from '../types';
import { cloneDeep } from 'lodash';

/**
 * Transform columns from the table prop to an internal form.
 * Still hierarchical so it can better determine which top level columns to hide/show.
 * 
 * @param tableId Table Identifier to help keep some keys unique.
 * @param propColumns The list of columns from the table props.
 * @param parentKey Internal use only for hierarchical data.
 */
export function transformColumns<T>(tableId: string, propColumns: Partial<DataColumnProp<T>>[], columnVisibility: ColumnVisibilityStorage, groupBy: ColumnSort[], parentKey: string = ''): DataColumn<T>[] {
  let columns: DataColumn<T>[] = [];
  let groupByNames = groupBy.map(g => g.column);

  let index: number = 0,
      numColumns: number = propColumns.length;
  for (;index < numColumns; index++) {
    const column = propColumns[index];

    if (typeof column.accessor === 'undefined' && typeof column.getValue === 'undefined' && typeof column.columns === 'undefined')
      console.error(`Column value is inaccessible and is not a Header Group`);
    
    if (typeof column.columns !== 'undefined' && (typeof column.accessor !== 'undefined' || typeof column.getValue !== 'undefined'))
      console.warn(`Header Group specified - accessor to value is unnecessary`);

    let key = getColumnKey(tableId, parentKey, index, column);
    let enabled: boolean = resolve(column.enabled, true);
    let visibleByDefault: boolean = resolve(column.visibleByDefault, true);
    let isVisible: boolean = getColumnIsVisible(key, {enabled, visibleByDefault}, columnVisibility);

    let filter = cloneDeep(column.filter);
    if (filter && !filter.filterKey) {
      filter.filterKey = column.name ?? (typeof column.accessor === 'string' ? column.accessor : undefined);
    }

    let transformedColumn: DataColumn<T> = {
      key,
      render: column.render,
      renderGroup: column.renderGroup,
      renderFooter: column.renderFooter,
      accessor: column.accessor,
      getValue: column.getValue,
      className: column.className,
      name: column.name ?? (typeof column.accessor === 'string' ? column.accessor : undefined),
      filter,
      isPrimaryKey: column.isPrimaryKey,
      editor: column.editor,
      canEdit: column.canEdit,
      EditorWrapper: column.EditorWrapper,
      preMDRColumnWidth: column.preMDRColumnWidth,

      header: resolve(column.header, ''),
      fixed: resolve(column.fixed, false),
      sortable: resolve(column.sortable, true), // TODO: Pull default from table options
      defaultSortDir: resolve(column.defaultSortDir, 'asc'),
      enabled,
      visibleByDefault,
      canToggleVisibility: resolve(column.canToggleVisibility, true),

      columns: !!column.columns
        ? transformColumns(tableId, column.columns, columnVisibility, groupBy, key)
        : undefined,

      isVisible,
      sortIndex: 0,
      rowSpan: 1,
      colSpan: 1,
      isGrouped: false,
      columnSearch: {
        enabled: !!column.columnSearch?.enabled && column.accessor != null,
        op: column.columnSearch?.op ?? 'con',
        renderSearchButton: !!column.columnSearch?.renderSearchButton,
      },
    };

    transformedColumn.isGrouped = transformedColumn.name ? !!groupByNames.includes(transformedColumn.name) : false;

    if (transformedColumn.columns?.length) {
      let visibleChildren = transformedColumn.columns.filter(c => c.isVisible).length;

      if (visibleChildren <= 1) {
        // add all the children to this level (so non-visible leaf-columns can still appear in selector)
        columns = columns.concat(transformedColumn.columns);
      } else {
        for (let col of transformedColumn.columns)
          col.parent = transformedColumn;
        columns.push(transformedColumn);
      }
    } else {
      columns.push(transformedColumn);
    }
  }
  return columns;
}

function getColumnKey<T>(tableId: string, parentKey: string, index: number, column: Partial<DataColumnProp<T>>): string {
  let key: string = '';
  if ((!!column.key || !!column.accessor) && !column.columns) {
    if (typeof column.key !== 'undefined') key = column.key;
    else if (typeof column.accessor === 'undefined')
      throw new Error(`Column key must be defined in the absense of a column accessor`);
    else {
      key = (typeof column.accessor === 'number')
        ? column.accessor.toString()
        : column.accessor;
    }
  }
  if (!key) {
    key = `${parentKey}${!!parentKey ? '' : tableId}_c${index}`;
  }
  return key;
}

function getColumnIsVisible<T>(key: string, column: Pick<DataColumn<T>, 'enabled' | 'visibleByDefault'>, columnVisibility: ColumnVisibilityStorage): boolean {
  if (!column.enabled) return false;

  let isVisible: boolean = column.visibleByDefault;
  if (typeof columnVisibility[key] !== 'undefined')
    isVisible = columnVisibility[key];
  return isVisible;
}


export function getFlattenedColumns<T>(visibleColumns: DataColumn<T>[], flattened: DataColumn<T>[] = []): DataColumn<T>[] {
  for (let c of visibleColumns) {
    if (c.columns?.length) {
      getFlattenedColumns(c.columns, flattened);
    } else {
      flattened.push(c);
    }
  }
  return flattened;
}

export function generateHeaderRows<T>(columns: DataColumn<T>[], columnOrder: string[]): DataColumn<T>[][] {
  const fixedColumns = columns.filter(c => !!c.fixed);
  const fixedLeftColumns = fixedColumns.filter(c => c.fixed === 'left').map(c => c.key);
  const fixedRightColumns = fixedColumns.filter(c => c.fixed === 'right').map(c => c.key);
  const normalColumns = columns.filter(c => !fixedColumns.includes(c)).map(c => c.key);
  const defaultOrder = [...fixedLeftColumns, ...normalColumns, ...fixedRightColumns];

  for (let i = 0, l = defaultOrder.length; i < l; i++) {
    let column = columns.find(c => c.key === defaultOrder[i]);
    if (column) column.sortIndex = i;
  }

  if (columnOrder.length) {
    const sortedOrder = [...fixedLeftColumns, ...columnOrder, ...fixedRightColumns];
    for (let i = 0, l = sortedOrder.length; i < l; i++) {
      let column = columns.find(c => c.key === sortedOrder[i]);
      if (column) column.sortIndex = i;
    }

    columns.sort((a, b) => a.sortIndex - b.sortIndex);
  }
  return generateHeaderRow(columns);
}

function generateHeaderRow<T>(columns: DataColumn<T>[], rows: DataColumn<T>[][] = []): DataColumn<T>[][] {
  let currentRow: DataColumn<T>[] = [];
  let parentRow: DataColumn<T>[] = [];

  let lastParent: DataColumn<T> | null | undefined = null;
  let currentColumnSpan: number = 1;
  for (let column of columns) {
    if (!column.isVisible || column.isGrouped) continue;
    currentRow.push(column);

    if (!!lastParent && lastParent === column.parent) {
      currentColumnSpan += column.colSpan;
      (lastParent as DataColumn<T>).colSpan = currentColumnSpan;
      if (!parentRow.includes(lastParent)) {
        parentRow.push(lastParent);
      }
    } else {
      currentColumnSpan = column.colSpan;
    }
    lastParent = column.parent;
  }

  if (parentRow.length) {
    let actualParentRow: DataColumn<T>[] = [];
    let actualCurrentRow: DataColumn<T>[] = [];

    for (let column of columns) {
      if (column.parent && parentRow.includes(column.parent)) {
        if (!actualParentRow.includes(column.parent))
          actualParentRow.push(column.parent);
        actualCurrentRow.push(column);
      } else {
        column.rowSpan++;
        actualParentRow.push(column);
      }
    }

    generateHeaderRow(actualParentRow, rows);
    rows.push(actualCurrentRow);
  } else {
    rows.push(currentRow);
  }
  
  return rows;
}
/*
|       a       |       b       |
|   c   |   d   |   e   |   f   |
| g | h | i | j | k | l | m | n |

{
  a: {
    c: { g, h }
    d: { i, j }
  }
  b: {
    e: { k , l }
    f: { m , n }
  }
}

a
  c, [g,h]
*/
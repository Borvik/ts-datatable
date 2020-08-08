import { DataColumnProp, DataColumn, ColumnVisibilityStorage } from '../components/table/types';
import { resolve } from '../types';

/**
 * Transform columns from the table prop to an internal form.
 * Still hierarchical so it can better determine which top level columns to hide/show.
 * 
 * @param tableId Table Identifier to help keep some keys unique.
 * @param propColumns The list of columns from the table props.
 * @param parentKey Internal use only for hierarchical data.
 */
export function transformColumns<T>(tableId: string, propColumns: Partial<DataColumnProp<T>>[], columnVisibility: ColumnVisibilityStorage, parentKey: string = ''): DataColumn<T>[] {
  let columns: DataColumn<T>[] = [];

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

    let transformedColumn: DataColumn<T> = {
      key,
      render: column.render,
      accessor: column.accessor,
      getValue: column.getValue,
      className: column.className,
      name: column.name ?? (typeof column.accessor === 'string' ? column.accessor : undefined),

      header: resolve(column.header, ''),
      fixed: resolve(column.fixed, false),
      sortable: resolve(column.sortable, true), // TODO: Pull default from table options
      defaultSortDir: resolve(column.defaultSortDir, 'asc'),
      filterable: resolve(column.filterable, true), // TODO: Pull default from table options
      enabled,
      visibleByDefault,
      canToggleVisibility: resolve(column.canToggleVisibility, true),

      columns: !!column.columns
        ? transformColumns(tableId, column.columns, columnVisibility, key)
        : undefined,

      isVisible,
      rowDepth: 1,
      rowSpan: 1,
      colSpan: 1,
      offset: 0,
    };

    if (transformedColumn.columns?.length) {
      transformedColumn.rowDepth += transformedColumn.columns[0].rowDepth;
      let visibleChildren = transformedColumn.columns.filter(c => c.isVisible).length;
      transformedColumn.colSpan = transformedColumn.columns.reduce((v, col) => {
        if (!col.isVisible) return v;
        return v + col.colSpan;
      }, 0);

      if (visibleChildren <= 1) {
        // add all the children to this level (so non-visible leaf-columns can still appear in selector)
        columns = columns.concat(transformedColumn.columns);
      } else {
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


// export function getVisibleColumns<T>(cleanColumns: DataColumn<T>[], columnVisibility: ColumnVisibilityStorage): DataColumn<T>[] {
//   let columns: DataColumn<T>[] = [];
//   //getColumnIsVisible(key, {enabled, visibleByDefault}, storedVisibility)
//   for (let index = 0; index < cleanColumns.length; index++) {
//     const column = cleanColumns[index];
//     const {
//       columns: children,
//       isVisible: removedIsVisible,
//       ...props
//     } = column;

//     let isVisible = getColumnIsVisible(column, columnVisibility);
//     let newColumn: DataColumn<T> = {
//       ...props,
//       isVisible,
//       columns: !!children
//         ? getVisibleColumns(children, columnVisibility)
//         : undefined
//     };

//     if (newColumn.columns?.length) {
//       let visibleChildren = newColumn.columns.filter(c => c.isVisible).length;
//       newColumn.colSpan = newColumn.columns.reduce((v, col) => {
//         if (!col.isVisible) return v;
//         return v + col.colSpan;
//       }, 0);

//       if (visibleChildren <= 1) {
//         // add all the children to this level (so non-visible leaf-columns can still appear in selector)
//         columns = columns.concat(newColumn.columns);
//       } else {
//         columns.push(newColumn);
//       }
//     } else {
//       columns.push(newColumn);
//     }
//   }
//   return columns;
// }

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

export function getHeaderRows<T>(visibleColumns: DataColumn<T>[]): DataColumn<T>[][] {
  let maxDepth: number = 1;
  for (let col of visibleColumns) {
    if (maxDepth < col.rowDepth)
      maxDepth = col.rowDepth;
  }

  let rows = buildHeaderRows(visibleColumns);
  for (let col of rows[0]) {
    col.rowSpan = (maxDepth - col.rowDepth) + 1;
  }

  return rows;
}

function buildHeaderRows<T>(visibleColumns: DataColumn<T>[], rows: DataColumn<T>[][] = [], depth: number = 0): DataColumn<T>[][] {
  // initialize this depth in the rows collection
  while (rows.length <= depth)
    rows.push([]);

  for (let col of visibleColumns) {
    if (col.columns?.length) {
      buildHeaderRows(col.columns, rows, depth + 1);
    }

    // add column to rows
    rows[depth].push(col);
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
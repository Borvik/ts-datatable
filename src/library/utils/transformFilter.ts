import { AllFilterOperators, QueryFilterGroup, DataColumn, ColumnFilter, isFilterItem, QueryFilterItem, FilterCollection } from "../components/table/types";
import { QueryStringFilterTypes } from '@borvik/querystring/dist/types';
import { convertValue } from '@borvik/querystring/dist/convert/convertValue';
import { getDefaultOperator } from "../components/filter/helpers";

export function transformTableFiltersToColumns<T>(filters: ColumnFilter[]): DataColumn<T>[] {
  return filters.map(filter => ({
    isVisible: true,
    rowSpan: 1,
    colSpan: 1,
    sortIndex: 0,
    isGrouped: false,
    header: '',
    fixed: false,
    sortable: false,
    defaultSortDir: 'asc',
    enabled: false,
    visibleByDefault: false,
    canToggleVisibility: false,
    key: filter.filterKey + '_filterOnly',
    filter
  }));
}

export function transformFilterValue(value: any, parseType: QueryStringFilterTypes, operator: AllFilterOperators): any {
  // based on operator depends on how value should be transformed
  // ex: `==` has a single value
  //     `in` has potentially many values
  //     `between` has two values
  switch (operator) {
    // currently don't have other operators available
    case 'bet':
    case 'nbet':
      let arrBetweenValue = Array.isArray(value)
        ? value
        : (typeof value === 'undefined' || value === null)
          ? []
          : [value];
      if (parseType.match(/\[\]$/))
        return convertValue(arrBetweenValue, parseType);
      return arrBetweenValue.map(v => convertValue(v, parseType));
    case 'any':
    case 'none':
      let arrAnyValue = Array.isArray(value)
        ? value
        : (typeof value === 'undefined' || value === null)
          ? []
          : [value];
      if (parseType.match(/\[\]$/))
        return convertValue(arrAnyValue, parseType);
      return arrAnyValue.map(v => convertValue(v, parseType));
    default: // single value operators
      return convertValue(value, parseType);
  }
}


interface QSFilterObj {
  filter?: any;
}

/**
 * Handles extracting `filter` from query string to pass to conversions
 */
export function convertFromQS<T>(qsFilter: QSFilterObj, columns: DataColumn<T>[]): QueryFilterGroup {
  let newFilter: QueryFilterGroup = { groupOperator: 'and', filters: [] };
  let actualQSFilter = qsFilter.filter ?? {};
  let filterKeys = Object.keys(actualQSFilter);
  if (!filterKeys.length) return newFilter;

  return convertFilterFromQS(actualQSFilter, columns);
}

/**
 * Handles top-level `filter` conversion
 */
function convertFilterFromQS<T>(qsFilter: any, columns: DataColumn<T>[]): QueryFilterGroup {
  let newFilter: QueryFilterGroup = { groupOperator: 'and', filters: [] };

  if (Array.isArray(qsFilter)) {
    // likely top-level, filtergroup - process group
    newFilter.filters = convertFilterGroupFromQS(qsFilter, columns);
  }
  else if (typeof qsFilter === 'object') {
    let keys = Object.keys(qsFilter);
    if (!keys.length) {
      console.error('Invalid query string filter object');
      return newFilter;
    }

    if (keys.length === 1 && ['and', 'or'].includes(keys[0])) {
      let operator = keys[0] as 'and' | 'or';
      newFilter.groupOperator = operator;

      if (!Array.isArray(qsFilter[operator]) && typeof qsFilter[operator] !== 'object') {
        console.error('Invalid query filter object');
        return newFilter;
      }
      
      let subFilter = Array.isArray(qsFilter[operator])
        ? qsFilter[operator]
        : [qsFilter[operator]];

      newFilter.filters = convertFilterGroupFromQS(subFilter, columns);
    }
    else {
      newFilter.filters = convertFilterGroupFromQS([qsFilter], columns);
    }
  }
  else {
    console.error('Unable to parse filter from query string (invalid filter)');
  }
  return newFilter;
}

/**
 * Handles recursive `filter` conversion for QueryFilterGroup
 */
function convertFilterGroupFromQS<T>(qsFilter: any[], columns: DataColumn<T>[]): FilterCollection {
  return qsFilter.reduce<FilterCollection>((list, filter) => {
    // could be filteritem or filtergroup
    let keys = Object.keys(filter);
    if (!keys.length) {
      console.error('Invalid query string filter object');
      return list;
    }

    if (keys.length === 1 && ['and', 'or'].includes(keys[0])) {
      let operator = keys[0] as 'and' | 'or';
      // filtergroup
      let group: QueryFilterGroup = { groupOperator: 'and', filters: [] };
      group.groupOperator = operator;

      if (!Array.isArray(filter[operator]) && typeof filter[operator] !== 'object') {
        console.error('Invalid query filter object');
        return list;
      }
      
      let subFilter = Array.isArray(filter[operator])
        ? filter[operator]
        : [filter[operator]];

      group.filters = convertFilterGroupFromQS(subFilter, columns);

      list.push(group);
      return list;
    }

    let opIndex = keys.indexOf('op');
    if (opIndex >= 0) {
      if (keys.length !== 2 && !(keys.length === 3 && keys.includes('meta'))) {
        console.error('Invalid qs QueryFilterItem');
        return list;
      }

      let colIdx = 1 - opIndex;
      let key = keys[colIdx];
      let item = convertFilterItemFromQS(filter, key, columns);
      if (item) {
        list.push(item);
      }
      return list;
    }

    // probably a simple object structure
    for (let key of keys) {
      let item = convertFilterItemFromQS(filter, key, columns)
      if (item)
        list.push(item);
    }

    return list;
  }, []);
}

/**
 * Handles conversion of QueryFilterItem
 */
function convertFilterItemFromQS<T>(filter: any, key: string, columns: DataColumn<T>[]): QueryFilterItem | null {
  // find the column
  let column = columns.find(c => c.filter?.filterKey === key);
  if (!column) return null;

  let operator = filter.op ??
    column.filter!.defaultOperator ??
    (column.filter!.operators?.length
      ? column.filter!.operators![0]
      : 'eq');

  let value: any = null;
  let metadata: any = undefined;
  if (filter.meta) {
    metadata = filter.meta;
  }
  try {
    if (['nul', 'nnul'].includes(operator)) {
      let nullValue = transformFilterValue(filter[key], 'boolean', 'eq');
      operator = !nullValue ? 'nnul' : 'nul';
    } else {
      let parseType = column.filter?.parseAsType;
      if (!parseType) {
        switch (column.filter?.type) {
          case 'boolean': parseType = 'boolean'; break;
          case 'number': parseType = 'number'; break;
          case 'string':
          case 'email':
            parseType = 'string'; break;
          default:
            parseType = 'any';
        }
      }
      value = transformFilterValue(filter[key], parseType, operator);
    }
  }
  catch (err) {
    console.error(err);
    return null;
  }

  let filterItem: QueryFilterItem = {
    column: key,
    value,
    operator,
    meta: metadata,
  };
  return filterItem;
}

export function convertToQS(filters: QueryFilterGroup, columns: DataColumn<any>[]): QSFilterObj {
  if (!filters.filters.length) return { filter: null };

  let qsFilter: any = convertFiltersToQS(filters.filters, columns);
  if (filters.groupOperator === 'or')
    qsFilter = {or: qsFilter};
  
  return { filter: qsFilter };
}

function convertFiltersToQS(filters: QueryFilterGroup['filters'], columns: DataColumn<any>[]) {
  let hasNestedQuery: boolean = false,
      allDefaultOperators: boolean = true,
      columnListedMultiple: boolean = false,
      columnHasMeta: boolean = false;

  let simpleColumnCheck: string[] = [];
  filters.every(f => {
    if (!isFilterItem(f)) {
      hasNestedQuery = true;
      return false; // falsy exits `every`
    } else {
      if (f.meta) {
        columnHasMeta = true;
        return false;
      }
      if (simpleColumnCheck.includes(f.column)) {
        columnListedMultiple = true;
        return false;
      }
      simpleColumnCheck.push(f.column);
      let column = columns.find(c => c.filter?.filterKey === f.column);
      let defaultOp = getDefaultOperator(column?.filter);
      if (f.operator !== defaultOp) {
        allDefaultOperators = false;
        return false;  // falsy exits `every`
      }
    }
    return true;
  });

  if (!hasNestedQuery && !columnHasMeta && allDefaultOperators && !columnListedMultiple) {
    let simpleFilter: any = {};
    for (let f of filters) {
      let ff = f as QueryFilterItem;
      if (ff.operator === 'nul')
        simpleFilter[ff.column] = true;
      else if (ff.operator === 'nnul')
        simpleFilter[ff.column] = false;
      else
        simpleFilter[ff.column] = ff.value;
    }
    return simpleFilter;
  }
  
  let result: any[] = filters.map(f => {
    if (!isFilterItem(f)) {
      return {[f.groupOperator]: convertFiltersToQS(f.filters, columns)}
    } else {
      let column = columns.find(c => c.filter?.filterKey === f.column);
      let defaultOp = getDefaultOperator(column?.filter);

      let usedOp = f.operator;
      let filterValue = f.value;
      if (f.operator === 'nul')
        filterValue = true;
      else if (f.operator === 'nnul') {
        filterValue = false;
        usedOp = 'nul';
      }

      if (f.operator === defaultOp) {
        if (f.meta) {
          return {[f.column]: filterValue, meta: f.meta};
        }
        return {[f.column]: filterValue};
      }
      if (f.meta) {
        return {[f.column]: filterValue, op: usedOp, meta: f.meta};
      }
      return {[f.column]: filterValue, op: usedOp};
    }
  });
  
  return result;
}
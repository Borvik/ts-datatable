import { QueryFilterGroup, QueryFilterItem, isFilterGroup } from "../library/components/table/types";

interface SqlResult {
  sql: string
  params: any
  fieldCounter: number
}

export function buildSQL(filter?: QueryFilterGroup, fieldCounter: number = 0): SqlResult {
  let params: any = {}

  function buildFilters(fgi: QueryFilterGroup | QueryFilterItem): string {
    let sql: string = '';
    if (isFilterGroup(fgi)) {
      let fgRes = buildSQL(fgi, fieldCounter);
      sql = fgRes.sql;
      fieldCounter = fgRes.fieldCounter;
      Object.assign(params, fgRes.params);
    } else if (fgi.column === 'who_knows') {
      // do nothing...
      sql = `(1 = 1)`;
    } else {
      switch (fgi.operator) {
        case 'eq':
          sql = `(${fgi.column} = :field${++fieldCounter})`;
          params[':field' + fieldCounter] = fgi.value;
          break;
        case 'ieq':
          sql = `(UPPER(${fgi.column}) = UPPER(:field${++fieldCounter}))`;
          params[':field' + fieldCounter] = fgi.value;
          break;
        case 'neq':
          sql = `(${fgi.column} <> :field${++fieldCounter})`;
          params[':field' + fieldCounter] = fgi.value;
          break;
        case 'gt':
          sql = `(${fgi.column} > :field${++fieldCounter})`;
          params[':field' + fieldCounter] = fgi.value;
          break;
        case 'gte':
          sql = `(${fgi.column} >= :field${++fieldCounter})`;
          params[':field' + fieldCounter] = fgi.value;
          break;
        case 'lt':
          sql = `(${fgi.column} < :field${++fieldCounter})`;
          params[':field' + fieldCounter] = fgi.value;
          break;
        case 'lte':
          sql = `(${fgi.column} <= :field${++fieldCounter})`;
          params[':field' + fieldCounter] = fgi.value;
          break;
        case 'bet':
          sql = `(${fgi.column} BETWEEN :field${++fieldCounter} AND :field${++fieldCounter})`;
          params[':field' + (fieldCounter - 1)] = fgi.value[0];
          params[':field' + fieldCounter] = fgi.value[1];
          break;
        case 'nbet':
          sql = `(${fgi.column} NOT BETWEEN :field${++fieldCounter} AND :field${++fieldCounter})`;
          params[':field' + (fieldCounter - 1)] = fgi.value[0];
          params[':field' + fieldCounter] = fgi.value[1];
          break;
        case 'con':
          sql = `(${fgi.column} LIKE :field${++fieldCounter})`;
          params[':field' + fieldCounter] = `%${fgi.value}%`;
          break;
        case 'ncon':
          sql = `(${fgi.column} NOT LIKE :field${++fieldCounter})`;
          params[':field' + fieldCounter] = `%${fgi.value}%`;
          break;
        case 'beg':
          sql = `(${fgi.column} LIKE :field${++fieldCounter})`;
          params[':field' + fieldCounter] = `${fgi.value}%`;
          break;
        case 'end':
          sql = `(${fgi.column} LIKE :field${++fieldCounter})`;
          params[':field' + fieldCounter] = `%${fgi.value}`;
          break;
        case 'nul':
          sql = `(${fgi.column} IS NULL)`;
          break;
        case 'nnul':
          sql = `(${fgi.column} IS NOT NULL)`;
          break;
        case 'any':
          let anyPlaceholders: string[] = [];
          for (let v of fgi.value) {
            let ph = ':field' + (++fieldCounter);
            anyPlaceholders.push(ph);
            params[ph] = v;
          }
          sql = `(${fgi.column} IN (${anyPlaceholders.join(', ')}))`;
          break;
        case 'none':
          let nonePlaceholders: string[] = [];
          for (let v of fgi.value) {
            let ph = ':field' + (++fieldCounter);
            nonePlaceholders.push(ph);
            params[ph] = v;
          }
          sql = `(${fgi.column} NOT IN (${nonePlaceholders.join(', ')}))`;
          break;
      }
    }
    return sql;
  }

  if (!filter) {
    return { sql: '', params: {}, fieldCounter };
  }
  
  let fullSql = '(' + filter.filters.map(f => buildFilters(f)).join(` ${filter.groupOperator} `) + ')';
  return {
    sql: fullSql,
    params,
    fieldCounter,
  };
}

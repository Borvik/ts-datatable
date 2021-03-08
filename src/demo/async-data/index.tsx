import React from 'react';
import { DataTable } from '../../library';
import { CommonColumns } from '../columns';
import { Pokemon, query } from '../db';
import { buildSQL } from '../sqlFilterBuilder';

export function AsyncDataExample() {
  return <DataTable<Pokemon>
    id='pokemon'
    fixedColBg='var(--dt-fixed-bg, white)'
    defaultSort={[
      {column: 'id', direction: 'asc'}
    ]}
    columns={CommonColumns}
    data={async ({ pagination, search, sorts, filters }) => {
      console.log('Running with filters:', filters);

      let filterSql = buildSQL(filters);
      console.log('Filter Sql:', filterSql);
      
      // This promise, timeout, and filter is all to
      // simulate an API call (sqlite calls synchrounous).
      return await new Promise(resolve => {
        setTimeout(() => {
          let params: any = {};
          let whereClauses: string[] = [];
          if (search) {
            params[':search'] = `%${search}%`;
            whereClauses.push(`(num LIKE :search OR name LIKE :search OR type LIKE :search)`);
          }

          if (filterSql.sql) {
            Object.assign(params, filterSql.params);
            whereClauses.push(filterSql.sql);
          }

          let offset = (pagination.page - 1) * pagination.perPage;
          let len = pagination.perPage;

          let whereQuery = whereClauses.length
            ? 'WHERE ' + whereClauses.join(' AND ')
            : '';

          let orderBy = sorts.length
            ? 'ORDER BY ' + sorts.map(s => `${s.column} ${s.direction}`).join(', ')
            : '';

          let countResult = query(`
            SELECT COUNT(*) as total
            FROM pokemon
            ${whereQuery}
          `, params);

          let fullResult = query(`
            SELECT *
            FROM pokemon
            ${whereQuery}
            ${orderBy}
            LIMIT ${len} OFFSET ${offset}
          `, params);

          resolve({
            total: countResult[0].total,
            data: fullResult,
          });
        }, 750);
      });

      // Function doesn't _need_ to be async, could
      // be synchronous, though wouldn't really be an api call

      // let offset = (pagination.page - 1) * pagination.limit;
      // let len = (pagination.page * pagination.limit);
          
      // return {
      //   total: pokemon.length,
      //   data: pokemon.slice(offset, len),
      // };
    }}
  />
}
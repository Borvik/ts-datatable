import initSqlJs from 'sql.js';
import { DataProps } from '../library';
import { buildSQL } from './sqlFilterBuilder';
import { cloneDeep } from 'lodash';

let DB: SQLDatabase | null = null;
const pokemon: Pokemon[] = require('./dataset.json').pokemon;

type ThenArg<T> = T extends Promise<infer U> ? U : T;
type SQL = ThenArg<ReturnType<typeof initSqlJs>>;
export type SQLDatabase = InstanceType<SQL['Database']>;

export function sqliteParams(obj: any): any {
  let result: any = {};
  let keys = Object.keys(obj);
  for (let k of keys) {
    if (typeof obj[k] === 'boolean')
      obj[k] = obj[k] ? 1 : 0;
    result[':' + k] = obj[k];
  }
  return result;
}

export function initializeDB(setDB: React.Dispatch<React.SetStateAction<SQLDatabase>>) {
  initSqlJs({
    locateFile: file => {
      return `/sqljs/${file}`
    }
  })
    .then(SQL => {
      DB = new SQL.Database();
      DB.run(`CREATE TABLE pokemon (
        id INTEGER primary key,
        num TEXT,
        name TEXT,
        img TEXT,
        type TEXT,
        height TEXT,
        weight TEXT,
        candy TEXT,
        candy_count INTEGER,
        egg TEXT,
        spawn_chance NUMERIC,
        avg_spawns NUMERIC,
        spawn_time TEXT,
        weaknesses TEXT,
        prev_evolution TEXT,
        next_evolution TEXT,
        evolves_to INTEGER,
        collected INTEGER not null default 0
      );`);
      DB.run(`CREATE TABLE pokemon_types (name);`)

      let uniqueTypes = new Set<string>();
      let insertStmt = `INSERT INTO pokemon VALUES (:id,:num,:name,:img,:type,:height,:weight,:candy,:candy_count,:egg,:spawn_chance,:avg_spawns,:spawn_time,:weaknesses,:prev_evolution,:next_evolution,:evolves_to,:collected)`;
      
      for (let creature of pokemon) {
        uniqueTypes = new Set<string>([...uniqueTypes, ...creature.type]);

        let obj: any = cloneDeep(creature);

        if (Array.isArray(obj.type)) obj.type = obj.type.join(', ');
        if (Array.isArray(obj.weaknesses)) obj.weaknesses = obj.weaknesses.join(', ');
        if (Array.isArray(obj.prev_evolution)) obj.prev_evolution = obj.prev_evolution.map((v: any) => v.name).join(' => ');
        if (Array.isArray(obj.next_evolution)) {
          obj.evolves_to = Number(obj.next_evolution[0].num);
          obj.next_evolution = obj.next_evolution.map((v: any) => v.name).join(' => ');
        }
        obj.collected = false;
        
        DB.run(insertStmt, sqliteParams(obj));
      }

      for (let typeName of uniqueTypes) {
        DB.run(`INSERT INTO pokemon_types VALUES(?);`, [typeName]);
      }
      
      setDB(DB); // Needed for re-render
    })
    .catch(err => console.error(err));
}

export interface Pokemon {
  id: number;
  num: string;
  name: string;
  img: string;
  type: string[];
  height: string;
  weight: string;
  candy: string;
  candy_count?: number;
  egg: string;
  spawn_chance: number;
  avg_spawns: number;
  spawn_time: string;
  multipliers: number[] | null;
  weaknesses: string[];
  prev_evolution?: Evolution[];
  next_evolution?: Evolution[];
  collected: boolean
}

interface Evolution {
  num: string;
  name: string;
}

export interface DataState {
  list: Pokemon[]
  total: number
  loading: boolean
}

export function query(sql: string, params?: any) {
  console.groupCollapsed('Running Query:', sql.trim().replace(/\s{2,}/g, ' '));
  console.log('Params:', params);

  let stmt = DB.prepare(sql);
  if (params) stmt.bind(params);

  let result: any[] = [];
  while (stmt.step()) {
    let dbRes = stmt.getAsObject();
    if (typeof dbRes.collected !== 'undefined')
      (dbRes as any).collected = !!dbRes.collected;
    result.push(dbRes);
  }
  stmt.free();

  let rowsModified = DB.getRowsModified();
  console.log('Result:', result);
  console.log('Rows Modified:', rowsModified);
  console.groupEnd();
  return result;
}

export async function onQueryChange({ pagination, search, sorts, filters }: DataProps, setDataState: React.Dispatch<React.SetStateAction<DataState>>) {
  console.log('Running static list with filters:', filters);
  let filterSql = buildSQL(filters);

  setDataState((st) => ({ list: st.list, total: st.total, loading: true }));
  await new Promise<void>((resolve) => {
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

      setDataState({
        list: fullResult,
        total: countResult[0].total,
        loading: false,
      });
      resolve();
    }, 750)
  })
}
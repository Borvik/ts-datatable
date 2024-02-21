import React, { ChangeEvent, FC, FormEvent, useCallback, useContext } from "react";
import { ColumnContext } from "../contexts";
import { QueryFilterItem, isFilterItem, ColumnSearch as ColumnSearchType } from "../types";
import { useDerivedState } from "../../../utils/useDerivedState";
import { batchedQSUpdate } from "@borvik/use-querystate";

interface Props {
  hasValidPreMDRColumn: boolean
  hasDetailRenderer: boolean
}

interface ColumnSearchQueryState {
  [x: string]: string | boolean
}

export const ColumnSearch: FC<Props> = function ColumnSearch(props) {
  const { hasValidPreMDRColumn, hasDetailRenderer } = props;
  const {
    actualColumns,
    canSelectRows,
    filter,
    setFilter,
    setPagination,
  } = useContext(ColumnContext);

  const [columnSearchQueries, setColumnSearchQueries] = useDerivedState<ColumnSearchQueryState>(() => {
    const columnSearchQueries: ColumnSearchQueryState = {};
    if (filter.groupOperator === 'and') {
      for (const columnFilter of filter.filters) {
        if (isFilterItem(columnFilter)) {
          const actualColumn = actualColumns.findIndex(c => (c.accessor == columnFilter.column && (c.columnSearch?.columnSearchOperator) == columnFilter.operator));
          if (actualColumn !== -1) {
            columnSearchQueries[columnFilter.column] = columnFilter.value;
          }
        }
      };
    }
    return columnSearchQueries;
  }, [filter, actualColumns]);

  const onSubmit = useCallback((e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    batchedQSUpdate(() => {
      setFilter((prevFilter) => {
        if (prevFilter.groupOperator === 'and') {
          const filtersToConcat: QueryFilterItem[] = [];
          const modifiedColumns = Object.keys(columnSearchQueries);
          const existingFilters = prevFilter.filters.map(filter => {
            if (isFilterItem(filter) && modifiedColumns.includes(filter.column)) {
              const actualColumn = actualColumns.find(c => (c.accessor == filter.column));
              const value = columnSearchQueries[filter.column];
              if (actualColumn?.columnSearch?.columnSearchOperator == filter.operator) {
                return {
                  ...filter,
                  value,
                }
              }
            }
            return filter;
          });
          for (const column of modifiedColumns) {
            const actualColumn = actualColumns.find(c => (c.accessor == column));
            if (actualColumn?.columnSearch) {
              if (existingFilters.findIndex(filter => (isFilterItem(filter) && filter.column == column && actualColumn.columnSearch!.columnSearchOperator === filter.operator)) == -1) {
                const value = columnSearchQueries[column];
                if (value != null && value != '') {
                  filtersToConcat.push({
                    column,
                    value,
                    operator: actualColumn.columnSearch.columnSearchOperator!,
                  });
                }
              }
            }
          }
          return {
            ...prevFilter,
            filters: [...existingFilters, ...filtersToConcat].filter(f => (!isFilterItem(f) || (f.value != null && f.value != ''))),
          };
        } else {
          const searchFilters: QueryFilterItem[] = [];
          for (const column of Object.keys(columnSearchQueries)) {
            if (columnSearchQueries[column] != null) {
              const actualColumn = actualColumns.find(c => (c.accessor == column));
              if (actualColumn?.columnSearch) {
                searchFilters.push({
                  column,
                  value: columnSearchQueries[column],
                  operator: actualColumn.columnSearch.columnSearchOperator!,
                });
              }
            }
          };
          return {
            groupOperator: 'and',
            filters: [
              { ...prevFilter },
              ...searchFilters,
            ].filter(f => (!isFilterItem(f) || (f.value != null && f.value != ''))),
          };
        }
      });
      setPagination(prev => ({ ...prev, page: 1 }));
    });
  }, [columnSearchQueries, actualColumns, setPagination, setFilter]);

  const onColumnSearchInput = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, column: string | number) => {
    const { target: { value } } = e;
    setColumnSearchQueries((prevState) => ({
      ...prevState,
      [column]: value,
    }));
  }, [setColumnSearchQueries]);

  return <tr>
    {hasValidPreMDRColumn && <th />}
    {hasDetailRenderer && <th />}
    {canSelectRows && <th />}
    {actualColumns.map((column, index) => {
      if (!column.isVisible || !column.enabled || column.isGrouped) {
        return null;
      } else {
        return <th key={`${column.key}-${index}`}>
          {!!(column.columnSearch && column.accessor) && <form onSubmit={onSubmit}>
            {column.columnSearch.type === 'string' && <input
              value={columnSearchQueries[column.accessor] as string ?? ''}
              onChange={(e) => onColumnSearchInput(e, column.accessor!)}
              onBlur={() => onSubmit()}
            />}
            {column.columnSearch.type === 'select' && <select
              defaultValue={columnSearchQueries[column.accessor] as string}
              onChange={(e) => onColumnSearchInput(e, column.accessor!)}
              onBlur={() => onSubmit()}
            >
              <option value=""/>
              {column.columnSearch.options.map((op, i) => (<option key={`${op.value}-${i}`} value={op.value}>{op.display}</option>))}
              </select>}
          </form>}
        </th>;
      }
    })}
  </tr>;
}
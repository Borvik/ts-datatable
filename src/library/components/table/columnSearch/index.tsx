import React, { FC, FormEvent, useCallback, useContext } from "react";
import { ColumnContext } from "../contexts";
import { QueryFilterItem, isFilterItem } from "../types";
import { useDerivedState } from "../../../utils/useDerivedState";
import { batchedQSUpdate } from "@borvik/use-querystate";

interface Props {
  hasValidPreMDRColumn: boolean
  hasDetailRenderer: boolean
}

interface ColumnSearchQueryState {
  [x: string]: string
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
          const actualColumn = actualColumns.find(c => (c.accessor == columnFilter.column));
          if (actualColumn?.columnSearch?.enabled && ((actualColumn.columnSearch.columnSearchOperator ?? 'con') == columnFilter.operator)) {
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
              if ((actualColumn?.columnSearch?.columnSearchOperator ?? 'con') == filter.operator) {
                return {
                  ...filter,
                  value: columnSearchQueries[filter.column],
                }
              }
            }
            return filter;
          });
          for (const column of modifiedColumns) {
            if (existingFilters.findIndex(filter => (isFilterItem(filter) && filter.column == column)) == -1) {
              const actualColumn = actualColumns.find(c => (c.accessor == column));
              if (actualColumn) {
                filtersToConcat.push({
                  column,
                  value: columnSearchQueries[column],
                  operator: actualColumn.columnSearch?.columnSearchOperator ?? 'con',
                });
              }
            }
          }
          return {
            ...prevFilter,
            filters: [...existingFilters, ...filtersToConcat],
          };
        } else {
          const searchFilters: QueryFilterItem[] = [];
          for (const column of Object.keys(columnSearchQueries)) {
            if (columnSearchQueries[column] != null) {
              const actualColumn = actualColumns.find(c => (c.accessor == column));
              searchFilters.push({
                column,
                value: columnSearchQueries[column],
                operator: actualColumn?.columnSearch?.columnSearchOperator ?? 'con',
              });
            }
          };
          return {
            groupOperator: 'and',
            filters: [
              { ...prevFilter },
              ...searchFilters,
            ]
          }; 
        }
      });
      setPagination(prev => ({ ...prev, page: 1 }));
    });
  }, [columnSearchQueries, actualColumns, setPagination, setFilter]);

  const onColumnSearchInput = useCallback((value: string, column?: string | number) => {
    if (column) {
      setColumnSearchQueries((prevState) => ({
        ...prevState,
        [column]: value,
      }));
    }
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
          {column.columnSearch?.renderSearchButton ? 
            <button onClick={() => onSubmit()}>search</button> : 
            <form onSubmit={onSubmit}>
              <input
                value={column.accessor ? columnSearchQueries[column.accessor] ?? '' : ''}
                disabled={!column.columnSearch?.enabled}
                onChange={(e) => onColumnSearchInput(e.target.value, column.accessor)}
              />
            </form>}
        </th>;
      }
    })}
  </tr>;
}
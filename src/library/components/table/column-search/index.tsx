import React, { FC, FormEvent, useCallback, useContext } from "react";
import { ColumnContext } from "../contexts";
import { QueryFilterItem, isFilterItem } from "../types";
import { useDerivedState } from "../../../utils/useDerivedState";
import { batchedQSUpdate } from "@borvik/use-querystate";
import { ColumnSearchInput } from "./column-search-input";

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

  const onColumnSearchInput = useCallback((newValue: string, column: string | number) => {
    setColumnSearchQueries((prevState) => ({
      ...prevState,
      [column]: newValue,
    }));
  }, [setColumnSearchQueries]);

  return <tr className="ts-data-table-column-search-row">
    {hasValidPreMDRColumn && <th />}
    {hasDetailRenderer && <th />}
    {canSelectRows && <th />}
    {actualColumns.map((column, index) => {
      if (!column.isVisible || !column.enabled || column.isGrouped) {
        return null;
      } else {
        return <th key={`${column.key}-${index}`}>
          {!!(column.columnSearch && column.accessor) && <form onSubmit={onSubmit}>
            <ColumnSearchInput
              columnSearch={column.columnSearch}
              accessor={column.accessor}
              value={columnSearchQueries[column.accessor]}
              onColumnSearchInput={onColumnSearchInput}
              onSubmit={onSubmit}
            />
          </form>}
        </th>;
      }
    })}
  </tr>;
}
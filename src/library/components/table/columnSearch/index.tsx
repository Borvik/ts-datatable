import React, { FC, FormEvent, memo, useCallback, useContext } from "react";
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

export const ColumnSearch: FC<Props> = memo(function ColumnSearch(props) {
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
    if (filter.groupOperator === 'and' || filter.filters.length) {
      for (const columnFilter of filter.filters) {
        if (isFilterItem(columnFilter)) {
          const actualColumn = actualColumns.find(c => (c.accessor == columnFilter.column));
          if (actualColumn?.columnSearch?.enabled && ((actualColumn?.columnSearch?.op != null && actualColumn.columnSearch.op == columnFilter.operator) || (actualColumn?.columnSearch?.op == null && columnFilter.operator == 'con'))) {
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
          const newFilters = [...prevFilter.filters];
          const filtersToConcat: QueryFilterItem[] = [];
          for (const column of Object.keys(columnSearchQueries)) {
            const value = columnSearchQueries[column];
            if (value != null) {
              const actualColumn = actualColumns.find(c => (c.accessor == column));
              const existingColumnIndex = newFilters.find((filter => (isFilterItem(filter) && ((actualColumn?.columnSearch?.op != null && actualColumn.columnSearch.op == filter.operator) || (actualColumn?.columnSearch?.op == null && filter.operator == 'con')) && filter.column == column)));
              if (existingColumnIndex) {
                (existingColumnIndex as QueryFilterItem).value = value;
              } else {
                filtersToConcat.push({
                  operator: actualColumn?.columnSearch?.op ?? 'con',
                  column,
                  value,
                });
              }
            }
          }
          return {
            ...prevFilter,
            filters: [...newFilters, ...filtersToConcat],
          };
        } else {
          const searchFilters: QueryFilterItem[] = [];
          for (const column of Object.keys(columnSearchQueries)) {
            if (columnSearchQueries[column] != null) {
              const actualColumn = actualColumns.find(c => (c.accessor == column));
              searchFilters.push({
                column,
                value: columnSearchQueries[column],
                operator: actualColumn?.columnSearch?.op ?? 'con',
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
})
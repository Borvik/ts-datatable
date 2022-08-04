import React, { PropsWithChildren, useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
import { DataTableProperties, ColumnVisibilityStorage, DataFnResult, ColumnSorts, QSColumnSorts, QueryFilterGroup, EditFormData, QuickEditFormData, QSGroupBy, GroupBy, ColumnSort, ColumnConfigurationWithGroup, Pagination } from './types';
import { useDeepDerivedState } from '../../utils/useDerivedState';
import { useQueryState, batchedQSUpdate } from '@borvik/use-querystate';
import { transformColumns, getFlattenedColumns, generateHeaderRows } from '../../utils/transformColumnProps';
import { useLocalState } from '../../utils/useLocalState';
import { ColumnContext } from './contexts';
import { TableHeader } from './header';
import { TableBody } from './body';
import { PageNav } from '../pagination';
import { useDeepEffect } from '../../utils/useDeepEffect';
import { SearchForm as SearchFormComponent } from '../search';
import { useParsedQs } from '../../utils/useParsedQS';
import { notEmpty } from '../../utils/comparators';
import { ColumnPickerButton } from '../column-picker';
import { FilterButton, FilterBar } from '../filter';
import { convertFromQS, convertToQS, transformTableFiltersToColumns } from '../../utils/transformFilter';
import { TableEditorButton } from './editors/editButton';
import { TableActionButtons } from './actions';
import { getRowKey, getRowValue } from '../../utils/getRowKey';
import { update } from '../../utils/immutable';
import { QueryString } from '@borvik/querystring';
import { DeepPartial } from '@borvik/use-querystate/dist/types';
import { TableFooter } from './footer';
import { TableContextProvider, useTableSelector } from './contexts';

const preMDR_RenderWarned: Record<string, boolean> = {};
const preMDR_WidthWarned: Record<string, boolean> = {};
const primaryKeyWarned: {[x:string]: boolean} = {};
const fixedLeftWarned: Record<string, boolean> = {};
const fixedRightWarned: Record<string, boolean> = {};

const DataTableCore = function DataTableCore<T, FooterData extends T = T>({paginate = 'both', quickEditPosition = 'both', hideSearchForm = false, defaultFilter, methodRef, passColumnsToQuery, ...props}: PropsWithChildren<DataTableProperties<T, FooterData>>) {
  const canGroupBy = !!props.canGroupBy && !!props.multiColumnSorts;

  /**
   * First let's get the user-defined column visibility
   * 
   * The first two values are the initializers the key the value _may_
   * be found at, and the default value if not found.
   * 
   * As long as props.id doesn't change this should always be the same
   * object.
   * 
   * setColumnVisibility allows for changing the value just like a
   * normal set function from `useState`, but here it also stores it
   * in localStorage at the key specified.
   */
  const [columnVisibility, setColumnVisibility] = useLocalState<ColumnVisibilityStorage>(
    `table.${props.id}.columns`, {}, [ props.id ]
  );

  const [columnOrder, setColumnOrder] = useLocalState<string[]>(`table.${props.id}.columnOrder`, [], [ props.id ]);

  const [qsGroupBy, setGroupBy] = useParsedQs<GroupBy, QSGroupBy>(
    { group: props.defaultGroupBy ?? [] },
    (qsSort) => ({ // parse
      group: (qsSort?.group ?? []).map(v => {
        let parts = v!.split(' ').filter(a => !!a);
        if (parts.length !== 2) return null;
        return {
          column: parts[0],
          direction: (parts[1].toLowerCase() === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
        }
      })
      .filter(notEmpty)
    }),
    (state) => { // encode
      if (!state.group.length && props.defaultGroupBy?.length) {
        return { group: [''] };
      }

      return {
        group: state.group.map(v => `${v.column} ${v.direction}`)
      };
    },
    {
      ...props.qs,
      types: {
        group: 'string[]'
      }
    }
  );

  const groupBy = canGroupBy
    ? qsGroupBy.group
    : [];

  const setColumnConfig = useCallback((config: ColumnConfigurationWithGroup) => {
    ReactDOM.unstable_batchedUpdates(() => {
      setColumnVisibility(config.visibility);
      setColumnOrder(config.columnOrder);
      setGroupBy({ group: config.groupBy });
    });
  }, [setColumnVisibility, setColumnOrder, setGroupBy]);

  /**
   * Using a deep comparison get the memoized column data.
   * 
   * This function is "memoized" to help keep the object reference
   * consistent - not necessarily to help with performance of a recursive
   * function (since deep compare needs recursive as well).
   * 
   * This is all necessary because of the columns prop.
   * If a `const` columns property is passed - it's not really necessary,
   * but if the more likely scenario is that the column definition is built
   * when the component is used - its a new reference every time.
   */
  const [columnData] = useDeepDerivedState(() => {
    // First Clean the columns - transforms "resolve | type" column properties
    let preMDRColumn = props.preMDRColumn ? transformColumns(props.id, [props.preMDRColumn], columnVisibility, groupBy) : null;
    let visibleColumns = transformColumns(props.id, props.columns, columnVisibility, groupBy);
    let actualColumns = getFlattenedColumns(visibleColumns);
    let headerRows = generateHeaderRows(actualColumns, props.canReorderColumns ? columnOrder : []);

    let primaryKeyCount: number = 0,
        fixedLeftCount: number = 0,
        fixedRightCount: number = 0,
        hasEditor: boolean = false;
    
    if (preMDRColumn?.[0]) {
      if (!preMDR_RenderWarned[props.id] && typeof preMDRColumn[0].render !== 'function') {
        console.warn(`Pre-MDR Column needs to have a render function defined`);
        preMDR_RenderWarned[props.id] = true;
      }

      if (!preMDR_WidthWarned[props.id] && typeof preMDRColumn[0].preMDRColumnWidth !== 'number') {
        console.warn(`Pre-MDR Column needs a width defined as a number`);
        preMDR_WidthWarned[props.id] = true;
      }
    }

    if (!props.getRowKey) {
      for (let c of actualColumns) {
        if (c.isPrimaryKey) {
          primaryKeyCount++;
          // Only warn once per table
          if (primaryKeyCount > 1 && !primaryKeyWarned[props.id]) {
            console.warn(`Primary Key defined twice - using first primary key`);
            primaryKeyWarned[props.id] = true;
          }
        }
        if (c.editor) hasEditor = true;
      }
    }

    if (!props.suppressFixedWarning && !fixedRightWarned[props.id] && !fixedLeftWarned[props.id]) {
      for (let c of actualColumns) {
        if (c.fixed === 'left') {
          fixedLeftCount++;
          // TODO: if more than 1 fixed column becomes supported - adjust left/right filters in column-picker/dialog to filter out first/last "hidden" columns respectively
          if (fixedLeftCount > 1 && !fixedLeftWarned[props.id]) {
            console.warn(`Default styles only support 1 fixed left column`);
            fixedLeftWarned[props.id] = true;
          }
        }
        if (c.fixed === 'right') {
          fixedRightCount++;
          if (fixedRightCount > 1 && !fixedRightWarned[props.id]) {
            console.warn(`Default styles only support 1 fixed right column`);
            fixedRightWarned[props.id] = true;
          }
        }
      }
    }
    
    // Now format the columns for easier use, and return as derived state
    return {
      headerRows,
      actualColumns,
      hasEditor,
      primaryKeyCount,
      preMDRColumn: preMDRColumn?.[0]
    }
  }, [ props.id, columnVisibility, props.preMDRColumn, props.columns, columnOrder, groupBy, props.canReorderColumns, canGroupBy ]);

  const actualColumnsComparator = columnData.actualColumns;
  const [filterColumns] = useDeepDerivedState(() => {
    let transformedFilters = transformTableFiltersToColumns<T>(props.filters ?? []);
    return [
      ...columnData.actualColumns,
      ...transformedFilters
    ]
  }, [props.filters, actualColumnsComparator])

  const canEdit = typeof props.onSaveQuickEdit === 'function' && columnData.hasEditor && (columnData.primaryKeyCount === 1 || typeof props.getRowKey === 'function');
  const canSelectRows = !!props.canSelectRows && (columnData.primaryKeyCount === 1 || typeof props.getRowKey === 'function');

  // const [editFormData, setFormData] = useState<EditFormData>({});
  const [selectedRows, setSelectedRows] = useState<Record<string | number, T>>({});

  const [pagination, setPagination] = useParsedQs<Pagination, DeepPartial<Pagination>>(
    {page: 1, perPage: props.paginateOptions?.defaultPerPage ?? 10},
    (qsPagination) => ({
      page: qsPagination.page ?? 1,
      perPage: qsPagination.perPage ?? props.paginateOptions?.defaultPerPage ?? 10,
    }),
    (state) => state,
    {
      ...props.qs
    }
  )

  const [searchQuery, setSearchQuery] = useQueryState({query: ''}, {
    ...props.qs
  });

  const { defaultRawFilter, defaultConvertedFilter } = useMemo(() => {
    if (typeof defaultFilter === 'string' || typeof defaultFilter === 'undefined') {
      if (!defaultFilter?.trim()) {
        return { defaultRawFilter: {}, defaultConvertedFilter: { groupOperator: 'and', filters: [] } as QueryFilterGroup };
      }

      // parse the filter string like query
      let parsedDefaultRawFilter = QueryString.parse(defaultFilter);
      parsedDefaultRawFilter = Object.keys(parsedDefaultRawFilter).length ? { filter: parsedDefaultRawFilter } : {};
      return {
        defaultRawFilter: parsedDefaultRawFilter,
        defaultConvertedFilter: convertFromQS(parsedDefaultRawFilter, filterColumns),
      };
    }

    const defaultRawFilter = { filter: defaultFilter };
    return {
      defaultRawFilter,
      defaultConvertedFilter: convertFromQS(defaultRawFilter, filterColumns),
    };
  }, [ defaultFilter, filterColumns ]);

  const [rawFilter, setRawFilter] = useQueryState<{filter?: any}>(defaultRawFilter, {
    ...props.qs,
    types: {
      filter: 'any'
    },
    filterToTypeDef: true,
  });

  const [filter, setFilter] = useParsedQs<QueryFilterGroup, {filter?: any}>(
    defaultConvertedFilter,
    (qsFilter) => convertFromQS(qsFilter, filterColumns),
    (state) => convertToQS(state, filterColumns),
    {
      ...props.qs,
      types: {
        filter: 'any'
      },
      filterToTypeDef: true,
    }
  )

  const [columnSort, setColumnSort] = useParsedQs<ColumnSorts, QSColumnSorts>(
    { sort: props.defaultSort ?? [] },
    (qsSort) => ({ // parse
      sort: (qsSort?.sort ?? []).map(v => {
        let parts = v!.split(' ').filter(a => !!a);
        if (parts.length !== 2) return null;
        return {
          column: parts[0],
          direction: (parts[1].toLowerCase() === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
        }
      })
      .filter(notEmpty)
    }),
    (state) => ({ // encode
      sort: state.sort.map(v => `${v.column} ${v.direction}`)
    }),
    {
      ...props.qs,
      types: {
        sort: 'string[]'
      }
    }
  );

  // const { setSaving, setIsEditing } = useTableSelector(({ setSaving, setIsEditing }) => ({
  //   setSaving,
  //   setIsEditing,
  // }));
  const [, setCtxData] = useTableSelector(() => ({}));
  const [editCount, setEditCount] = useState(0);

  const [stateDataList, setDataList] = useState<DataFnResult<T[], FooterData[]>>({ data: [], total: 0 });
  const [dataLoading, setLoading] = useState(true);
  const [dataLoaderEl, setDataLoaderEl] = useState<React.ReactElement<any> | null>(null);
  
  function doSetDataList(data: T[] | DataFnResult<T[], FooterData[]>) {
    if (Array.isArray(data)) {
      setDataList({ data: data, total: data.length });
    } else {
      setDataList(data);
    }
    setLoading(false);
  }

  const visibleColumnComparator = passColumnsToQuery ? actualColumnsComparator : false;

  useDeepEffect(() => {
    async function getData() {
      let fullSort: ColumnSort[] = [
        ...groupBy,
        ...columnSort.sort.filter(s => (!groupBy.length || !groupBy.find(g => g.column === s.column))),
      ];

      if (typeof props.onQueryChange === 'function') {
        props.onQueryChange({
          pagination,
          search: hideSearchForm ? '' : (searchQuery.query ?? ''),
          sorts: fullSort,
          filters: filter.filters.length ? filter : undefined,
          visibleColumns: columnData.actualColumns.filter(c => c.isVisible),
        });
      }

      if (typeof props.data === 'function') {
        let returnedData = await props.data({
          pagination,
          search: hideSearchForm ? '' : (searchQuery.query ?? ''),
          sorts: fullSort,
          filters: filter.filters.length ? filter : undefined,
          visibleColumns: columnData.actualColumns.filter(c => c.isVisible),
        }, doSetDataList);

        if (React.isValidElement(returnedData)) {
          setDataLoaderEl(returnedData);
        }
        else {
          doSetDataList(returnedData);
        }
      } else {
        doSetDataList({
          data: props.data,
          total: typeof props.totalCount === 'undefined'
            ? props.data.length
            : props.totalCount,
          footerData: props.footerData,
        });
      }
    }

    setLoading(true);
    doSetSelectedRows({});
    // TODO: clear edit data (on filter/page/search)?
    getData();
  }, [ pagination, searchQuery.query, filter, columnSort, groupBy, editCount, canGroupBy, visibleColumnComparator ]);

  const Paginate = props.components?.Paginate ?? PageNav;
  const SearchForm = props.components?.SearchForm ?? SearchFormComponent;
  const ActionButtons = props.components?.ActionButtons ?? TableActionButtons;

  let wrapperStyle: any = {
    '--ts-dt-fixed-bg': props.fixedColBg ?? 'white'
  };

  if (typeof columnData.preMDRColumn?.preMDRColumnWidth === 'number') {
    wrapperStyle['--premdr-width'] = `${columnData.preMDRColumn.preMDRColumnWidth}px`;
  }

  const topEl = useRef<HTMLDivElement>(null);
  const theadEl = useRef<HTMLTableSectionElement>(null);

  // The resize here is to check if the top area is to small and should wrap
  // page/action buttons vs. search/filter bar
  useEffect(() => {
    function topResize() {
      let width = topEl.current?.offsetWidth ?? 99999;
      if (width < 800) {
        topEl.current!.classList.add('wrap');
      } else {
        topEl.current!.classList.remove('wrap');
      }
    }
    window.addEventListener('resize', topResize)
    topResize();
    return () => {
      window.removeEventListener('resize', topResize);
    }
  }, []);

  // On page change - ensure scrolled to top (if enabled)
  let scrollToTopEnabled = !(props.paginateOptions?.disableScrollToTop);
  let scrollToTopLoaded = useRef(false);
  useEffect(() => {
    /**
     * Need both of these depending on the UI styling.
     * 
     * The two scenarios depend on page styling and up to developer:
     *   1. Bottom actions and scrollbar always visible (ideal)
     *   2. Whole page scrolls
     * 
     * For scenario 1 - scrolling to topEl (search/action buttons)
     * doesn't really work as they are also always visible so we need
     * to scroll to show thead (which also breaks down for fixed headers,
     * but that isn't supported yet).
     * 
     * For scenario 2 - scrolling to thead, while it would work, probably
     * isn't ideal, as it's nice to get the top page nav and action buttons
     * available.
     * 
     * We can't detect these scenarios - so we do both.
     * thead first, then a topEl and the topEl one might not scroll
     * 
     * If we did it the other way - then it _might_ scroll back down
     * and hide part of topEl.
     */
    if (scrollToTopLoaded.current && scrollToTopEnabled) {
      theadEl.current?.scrollIntoView();
      topEl.current?.scrollIntoView();
    }
    scrollToTopLoaded.current = true;
  }, [ pagination, scrollToTopEnabled, scrollToTopLoaded ]);


  let propOnSave = props.onSaveQuickEdit;
  let propGetRowKey = props.getRowKey;
  let currentData = typeof props.data === 'function' ? stateDataList.data : props.data;
  const onSaveQuickEdit = useCallback(async (data: QuickEditFormData<T>) => {
    try {
      if (!!propOnSave && Object.keys(data).length) {
        setCtxData({ isSavingQuickEdit: true });
        let rowsToSave = Object.keys(data);
        let primaryColumn = columnData.actualColumns.find(c => c.isPrimaryKey)!;
        let originalData: QuickEditFormData<T> = {};
        let rowKeyFn = typeof propGetRowKey === 'function'
          ? propGetRowKey
          : getRowValue;

        for (let id of rowsToSave) {
          let rowData = currentData.find(r => rowKeyFn(r, primaryColumn) == id)!;
          originalData[id] = rowData;
        }

        await propOnSave(data, originalData);
        setCtxData({ editData: {} });
        setEditCount(c => c + 1);
      }
      setCtxData({ isEditing: false });
    }
    catch {
      // avoid unhandled exception
    }
    finally {
      setCtxData({ isSavingQuickEdit: false });
    }
  }, [propOnSave, currentData, actualColumnsComparator, propGetRowKey]);

  function doSetSelectedRows(selection: Record<string | number, T>) {
    if (typeof props.onSelectionChange === 'function') {
      // raise
      let keys = Object.keys(selection);
      let values = Object.values(selection);
      props.onSelectionChange(keys, values);
    }
    setSelectedRows(selection);
  }

  function setAllSelected(selectAll: boolean) {
    let data = typeof props.data === 'function' ? stateDataList.data : props.data;
    let newSelected: Record<string | number, T> = {};
    if (selectAll) {
      data.map((row, idx) => {
        if (typeof props.canSelectRow === 'function' && !props.canSelectRow(row))
          return row;
        let rowKey = getRowKey(row, idx, columnData.actualColumns, props.getRowKey);
        newSelected[rowKey] = row;
        return row;
      });
    }
    doSetSelectedRows(newSelected);
  }

  function setRowSelected(row: any, rowIndex: number) {
    let rowKey = getRowKey(row, rowIndex, columnData.actualColumns, props.getRowKey);
    let exists = typeof selectedRows[rowKey] !== 'undefined';
    
    if (!exists) {
      doSetSelectedRows(update(selectedRows, {
        [rowKey]: { $set: row },
      }));
    } else {
      doSetSelectedRows(update(selectedRows, {
        $unset: [rowKey]
      }));
    }
  }

  const searchFormOnSearch = useCallback((query: string) => {
    batchedQSUpdate(() => {
      setSearchQuery({ query });
      setPagination(prev => ({ page: 1, perPage: prev.perPage }));
    });
  }, [setSearchQuery, setPagination]);

  const searchFormApplyFilter = useCallback((newFilter: any) => {
    batchedQSUpdate(() => {
      setRawFilter({ filter: newFilter });
      setPagination(prev => ({ page: 1, perPage: prev.perPage }));
    });
  }, [setRawFilter, setPagination]);

  const actualColumnSorts = useMemo(() => {
    return [
      ...groupBy,
      ...columnSort.sort.filter(s => (!groupBy.length || !groupBy.find(g => g.column === s.column))),
    ]
  }, [ groupBy, columnSort ]);

  useImperativeHandle(methodRef, () => ({
    clearSelection: () => {
      doSetSelectedRows({});
    },
    getState: () => {
      return {
        filter,
        query: searchQuery.query,
        sort: columnSort.sort,
        columnConfig: {
          columnOrder,
          visibility: columnVisibility,
          groupBy: qsGroupBy.group
        }
      };
    },
    setState: (value) => {
      batchedQSUpdate(() => {
        if (value.filter) {
          setFilter(value.filter);
        }
        if (value.query) {
          setSearchQuery({ query: value.query });
        }
        if (value.sort) {
          setColumnSort({ sort: value.sort });
        }
        if (value.columnConfig) {
          ReactDOM.unstable_batchedUpdates(() => {
            setColumnVisibility(value.columnConfig!.visibility);
            setColumnOrder(value.columnConfig!.columnOrder);
            setGroupBy({ group: value.columnConfig!.groupBy });
          });
        }
        setPagination(prev => ({ page: 1, perPage: prev.perPage }));
      })
    },
  }), [
    doSetSelectedRows,
    filter, setFilter,
    searchQuery, setSearchQuery,
    columnSort, setColumnSort,
    columnVisibility, setColumnVisibility,
    columnOrder, setColumnOrder,
    qsGroupBy, setGroupBy
  ]);

  const footerData = typeof props.data === 'function' ? stateDataList.footerData : props.footerData;

  let tableContainerClasses: string[] = ['ts-datatable', 'ts-datatable-container'];
  if (props.tableContainerProps?.className) tableContainerClasses.push(props.tableContainerProps?.className);
  if ((props.fixedHeaders ?? true)) tableContainerClasses.push('fixed-headers');

  /**
   * Finally we setup the contexts that will house all the data
   * and pass it to all the subcomponents for eventual display.
   */
  return (<>
    {dataLoaderEl}
    <ColumnContext.Provider value={{
      ...columnData,
      filterColumns,
      canGroupBy,
      columnSorts: actualColumnSorts,
      groupBy: groupBy,
      multiColumnSorts: props.multiColumnSorts ?? false,
      filter,
      filterSettings: props.filterSettings,
      canSelectRows,
      selectedRows,
      setFilter,
      setColumnSort,
      setAllSelected,
      setRowSelected,
      onShowColumnPicker: props.onShowColumnPicker,
      onShowFilterEditor: props.onShowFilterEditor,
      setPagination,
      getRowKey: props.getRowKey,
      onSaveQuickEdit,
      DetailRow: props.DetailRow,
      canRowShowDetail: props.canRowShowDetail,
      columnOrder,
      setColumnConfig,
      canReorderColumns: props.canReorderColumns ?? false,
      classNames: props.classNames,
      labels: props.labels,
      components: props.components,
      canSelectRow: props.canSelectRow,
      groupsExpandedByDefault: props.groupsExpandedByDefault ?? true,
      doNotUseHTML5Dialog: props.doNotUseHTML5Dialog,
      getTableRowProps: props.getTableRowProps,
      getTableCellProps: props.getTableCellProps
    }}>
      <div id={props.id} style={wrapperStyle} {...(props.tableContainerProps ?? {})} className={tableContainerClasses.join(' ')}>
        <div ref={topEl} className={`ts-datatable-top`}>
          <div className='ts-datatable-search-filters'>
            {!hideSearchForm && <SearchForm
              searchQuery={searchQuery.query ?? ''}
              filter={rawFilter.filter}
              onSearch={searchFormOnSearch}
              applyFilter={searchFormApplyFilter}
            />}
            <FilterBar />
          </div>
          <div className='ts-datatable-page-actions'>
            <div className="ts-datatable-actions">
              <ActionButtons
                position='top'
                quickEditPosition={quickEditPosition}
                buttons={{
                  quickEdit: <TableEditorButton
                    setEditing={setIsEditing}
                    canEdit={canEdit}
                  />,
                  filter: <FilterButton />,
                  columnPicker: <ColumnPickerButton />,
                }}
              />
            </div>
            {(paginate === 'top' || paginate === 'both') &&
              <Paginate
                {...props.paginateOptions}
                {...pagination}
                changePage={(page) => setPagination(prev => ({ ...prev, ...page }))}
                total={typeof props.data === 'function' ? stateDataList.total : props.totalCount}
            />}
          </div>
        </div>
        <div {...(props.tableWrapperProps ?? {})} className={`ts-datatable-wrapper ${props.tableWrapperProps?.className ?? ''}`}>
          <table {...(props.tableProps ?? {})} className={`ts-datatable-table ${props.tableProps?.className ?? ''}`}>
            <TableHeader
              headRef={theadEl}
              data={typeof props.data === 'function' ? stateDataList.data : props.data}
            />
            <TableBody
              getRowKey={props.getRowKey}
              canEditRow={props.canEditRow}
              data={typeof props.data === 'function' ? stateDataList.data : props.data}
              loading={typeof props.data === 'function' ? dataLoading : (props.isLoading ?? false)}
              LoadingComponent={props.components?.Loading}
            />
            {footerData?.length && <TableFooter
              data={footerData}
            />}
          </table>
        </div>
        {(paginate === 'bottom' || paginate === 'both') &&
          <div className='ts-datatable-bottom-page'>
            <Paginate
              {...props.paginateOptions}
              {...pagination}
              changePage={(page) => setPagination(prev => ({ ...prev, ...page }))}
              total={typeof props.data === 'function' ? stateDataList.total : props.totalCount}
            />
          </div>}
        <div className="ts-datatable-bottom-actions">
          <ActionButtons
            position='bottom'
            quickEditPosition={quickEditPosition}
            buttons={{
              quickEdit: <TableEditorButton
                setEditing={setIsEditing}
                canEdit={canEdit}
              />,
              filter: <FilterButton />,
              columnPicker: <ColumnPickerButton />,
            }}
          />
        </div>
      </div>
    </ColumnContext.Provider>
  </>);
};


/**
 * Basic Structure
 * <full container>
 *    <section>
 *      <form>
 *      <actions>
 *    <section>
 *      <filter>
 *      <pages>
 *    <table-wrapper>
 *      <table>
 *        <table-header>
 *        <table-body>
 *    <section>
 *      <actions>
 *    <section>
 *      <pages>
 */

export const DataTable = function DataTable<T, FooterData extends T = T>({editMode, ...props}: PropsWithChildren<DataTableProperties<T, FooterData>>) {
  return (
    <TableContextProvider editMode={editMode ?? 'default'}>
      <DataTableCore {...props} />
    </TableContextProvider>
  );
};
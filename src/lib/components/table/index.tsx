import React, { PropsWithChildren, useState, useEffect, useRef, useCallback } from 'react';
import { DataTableProperties, ColumnVisibilityStorage, DataFnResult, ColumnSorts, QSColumnSorts, QueryFilterGroup, EditFormData, QuickEditFormData, QSGroupBy, GroupBy, ColumnSort } from './types';
import { useDeepDerivedState } from '../../utils/useDerivedState';
import { useQueryState, batchedQSUpdate } from '../../utils/useQueryState';
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
import { convertFromQS, convertToQS } from '../../utils/transformFilter';
import { TableEditorButton } from './editors/editButton';
import { TableActionButtons } from './actions';
import { getRowKey } from '../../utils/getRowKey';
import { update } from '../../utils/immutable';

const primaryKeyWarned: {[x:string]: boolean} = {};
const fixedLeftWarned: Record<string, boolean> = {};
const fixedRightWarned: Record<string, boolean> = {};

export const DataTable = function<T>({paginate = 'both', quickEditPosition = 'both', hideSearchForm = false, ...props}: PropsWithChildren<DataTableProperties<T>>) {
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

  const [groupBy, setGroupBy] = useParsedQs<GroupBy, QSGroupBy>(
    { group: props.defaultGroupBy ?? [] },
    (qsSort) => ({ // parse
      group: qsSort.group.map(v => {
        let parts = v.split(' ').filter(a => !!a);
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
      properties: {
        group: 'string[]'
      }
    }
  );

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
    let visibleColumns = transformColumns(props.id, props.columns, columnVisibility, canGroupBy ? groupBy.group : []);
    let actualColumns = getFlattenedColumns(visibleColumns);
    let headerRows = generateHeaderRows(actualColumns, props.canReorderColumns ? columnOrder : []);

    let primaryKeyCount: number = 0,
        fixedLeftCount: number = 0,
        fixedRightCount: number = 0,
        hasEditor: boolean = false;
    
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
    }
  }, [ props.id, columnVisibility, props.columns, columnOrder, groupBy.group, props.canReorderColumns, canGroupBy ]);

  const canEdit = typeof props.onSaveQuickEdit === 'function' && columnData.hasEditor && (columnData.primaryKeyCount === 1 || typeof props.getRowKey === 'function');
  const canSelectRows = !!props.canSelectRows && (columnData.primaryKeyCount === 1 || typeof props.getRowKey === 'function');

  const [editFormData, setFormData] = useState<EditFormData>({});
  const [selectedRows, setSelectedRows] = useState<Record<string | number, T>>({});

  const [pagination, setPagination] = useQueryState({page: 1, perPage: props.paginateOptions?.defaultPerPage ?? 10}, {
    ...props.qs
  });

  const [searchQuery, setSearchQuery] = useQueryState({query: ''}, {
    ...props.qs
  });

  const [filter, setFilter] = useParsedQs<QueryFilterGroup, {filter?: any}>(
    { groupOperator: 'and', filters: [] },
    (qsFilter) => convertFromQS(qsFilter, columnData.actualColumns),
    (state) => convertToQS(state, columnData.actualColumns),
    {
      ...props.qs,
      properties: {
        filter: 'any'
      }
    }
  )

  const [columnSort, setColumnSort] = useParsedQs<ColumnSorts, QSColumnSorts>(
    { sort: props.defaultSort ?? [] },
    (qsSort) => ({ // parse
      sort: qsSort.sort.map(v => {
        let parts = v.split(' ').filter(a => !!a);
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
      properties: {
        sort: 'string[]'
      }
    }
  );

  const [isEditing, setEditing] = useState(false);
  const [isSavingQuickEdit, setSaving] = useState(false);
  const [editCount, setEditCount] = useState(0);

  const [stateDataList, setDataList] = useState<DataFnResult<T[]>>({ data: [], total: 0 });
  const [dataLoading, setLoading] = useState(true);
  const [dataLoaderEl, setDataLoaderEl] = useState<React.ReactElement<any> | null>(null);
  
  function doSetDataList(data: T[] | DataFnResult<T[]>) {
    if (Array.isArray(data)) {
      setDataList({ data: data, total: data.length });
    } else {
      setDataList(data);
    }
    setLoading(false);
  }

  useDeepEffect(() => {
    async function getData() {
      let fullSort: ColumnSort[] = [
        ...(canGroupBy ? groupBy.group : []),
        ...columnSort.sort.filter(s => (!canGroupBy || !groupBy.group.find(g => g.column === s.column))),
      ];

      if (typeof props.onQueryChange === 'function') {
        props.onQueryChange({
          pagination,
          search: hideSearchForm ? '' : searchQuery.query,
          sorts: fullSort,
          filters: filter.filters.length ? filter : undefined,
        });
      }

      if (typeof props.data === 'function') {
        let returnedData = await props.data({
          pagination,
          search: hideSearchForm ? '' : searchQuery.query,
          sorts: fullSort,
          filters: filter.filters.length ? filter : undefined,
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
            : props.totalCount
        });
      }
    }

    setLoading(true);
    doSetSelectedRows({});
    getData();
  }, [ pagination, searchQuery.query, filter, columnSort, groupBy.group, editCount, canGroupBy ]);

  const Paginate = props.components?.Paginate ?? PageNav;
  const SearchForm = props.components?.SearchForm ?? SearchFormComponent;
  const ActionButtons = props.components?.ActionButtons ?? TableActionButtons;

  let wrapperStyle: any = {
    '--ts-dt-fixed-bg': props.fixedColBg ?? 'white'
  };

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
  useEffect(() => {
    if (!scrollToTopEnabled) return;
    
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
    theadEl.current?.scrollIntoView();
    topEl.current?.scrollIntoView();
  }, [ pagination, scrollToTopEnabled ]);


  let propOnSave = props.onSaveQuickEdit;
  const onSaveQuickEdit = useCallback(async (data: QuickEditFormData<T>) => {
    try {
      if (!!propOnSave && Object.keys(data).length) {
        setSaving(true)
        await propOnSave(data);
        setFormData({});
        setEditCount(c => c + 1);
      }
      setEditing(false);
    }
    catch {
      // avoid unhandled exception
    }
    finally {
      setSaving(false);
    }
  }, [propOnSave]);

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

  /**
   * Finally we setup the contexts that will house all the data
   * and pass it to all the subcomponents for eventual display.
   */
  return (<>
    {dataLoaderEl}
    <ColumnContext.Provider value={{
      ...columnData,
      canGroupBy,
      columnSorts:  [
        ...(canGroupBy ? groupBy.group : []),
        ...columnSort.sort.filter(s => (!canGroupBy || !groupBy.group.find(g => g.column === s.column))),
      ],
      groupBy: canGroupBy ? groupBy.group : [],
      multiColumnSorts: props.multiColumnSorts ?? false,
      filter,
      filterSettings: props.filterSettings,
      isEditing,
      isSavingQuickEdit,
      editData: editFormData,
      canSelectRows,
      selectedRows,
      setFormData: setFormData,
      setFilter,
      setColumnVisibility,
      setColumnSort,
      setGroupBy,
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
      setColumnOrder,
      canReorderColumns: props.canReorderColumns ?? false,
      classNames: props.classNames,
      labels: props.labels,
      components: props.components,
      canSelectRow: props.canSelectRow,
      groupsExpandedByDefault: props.groupsExpandedByDefault ?? true,
    }}>
      <div id={props.id} style={wrapperStyle} {...(props.tableContainerProps ?? {})} className={`ts-datatable ts-datatable-container ${props.tableContainerProps?.className ?? ''}`}>
        <div ref={topEl} className={`ts-datatable-top`}>
          <div className='ts-datatable-search-filters'>
            {!hideSearchForm && <SearchForm
              searchQuery={searchQuery.query}
              onSearch={(query) => {
                batchedQSUpdate(() => {
                  setSearchQuery({ query });
                  setPagination({ page: 1 });
                });
              }}
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
                    setEditing={setEditing}
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
                changePage={(page) => setPagination(page)}
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
          </table>
        </div>
        {(paginate === 'bottom' || paginate === 'both') &&
          <div className='ts-datatable-bottom-page'>
            <Paginate
              {...props.paginateOptions}
              {...pagination}
              changePage={(page) => setPagination(page)}
              total={typeof props.data === 'function' ? stateDataList.total : props.totalCount}
            />
          </div>}
        <div className="ts-datatable-bottom-actions">
          <ActionButtons
            position='bottom'
            quickEditPosition={quickEditPosition}
            buttons={{
              quickEdit: <TableEditorButton
                setEditing={setEditing}
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
import React, { PropsWithChildren, useState, useEffect, useRef, useCallback } from 'react';
import { DataTableProperties, ColumnVisibilityStorage, DataFnResult, ColumnSorts, QSColumnSorts, QueryFilterGroup, EditFormData, QuickEditFormData } from './types';
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

const primaryKeyWarned: {[x:string]: boolean} = {};

export const DataTable = function<T>({paginate = 'both', quickEditPosition = 'both', hideSearchForm = false, ...props}: PropsWithChildren<DataTableProperties<T>>) {
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
    let visibleColumns = transformColumns(props.id, props.columns, columnVisibility);
    let actualColumns = getFlattenedColumns(visibleColumns);
    let headerRows = generateHeaderRows(actualColumns, props.canReorderColumns ? columnOrder : []);

    let primaryKeyCount: number = 0, hasEditor: boolean = false;
    
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
    
    // Now format the columns for easier use, and return as derived state
    return {
      headerRows,
      actualColumns,
      hasEditor,
      primaryKeyCount,
    }
  }, [ props.id, columnVisibility, props.columns, columnOrder, props.canReorderColumns ]);

  const canEdit = typeof props.onSaveQuickEdit === 'function' && columnData.hasEditor && (columnData.primaryKeyCount === 1 || typeof props.getRowKey === 'function');

  const [editFormData, setFormData] = useState<EditFormData>({});

  const [pagination, setPagination] = useQueryState({page: 1, perPage: 10}, {
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
  
  useDeepEffect(() => {
    async function getData() {
      if (typeof props.data === 'function') {
        let returnedData = await props.data({
          pagination,
          search: hideSearchForm ? '' : searchQuery.query,
          sorts: columnSort.sort,
          filters: filter.filters.length ? filter : undefined,
        });

        if (Array.isArray(returnedData)) {
          setDataList({ data: returnedData, total: returnedData.length });
        } else {
          setDataList(returnedData);
        }
      } else {
        setPagination({ perPage: props.data.length });
        setDataList({
          data: props.data,
          total: typeof props.totalCount === 'undefined'
            ? props.data.length
            : props.totalCount
        });
      }
      setLoading(false);
    }
    setLoading(true);
    getData();
  }, [ pagination, searchQuery.query, filter, columnSort, editCount ]);

  const Paginate = props.components?.Paginate ?? PageNav;
  const SearchForm = props.components?.SearchForm ?? SearchFormComponent;

  let wrapperStyle: any = {
    '--ts-dt-fixed-bg': props.fixedColBg ?? 'white'
  };

  const topEl = useRef<HTMLDivElement>(null);

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

  /**
   * Finally we setup the contexts that will house all the data
   * and pass it to all the subcomponents for eventual display.
   */
  return (
    <React.Fragment key={props.id}>
      <ColumnContext.Provider value={{
        ...columnData,
        columnSorts: columnSort.sort,
        multiColumnSorts: props.multiColumnSorts ?? false,
        filter,
        filterSettings: props.filterSettings,
        isEditing,
        isSavingQuickEdit,
        editData: editFormData,
        setFormData: setFormData,
        setFilter,
        setColumnVisibility,
        setColumnSort,
        onShowColumnPicker: props.onShowColumnPicker,
        setPagination,
        getRowKey: props.getRowKey,
        onSaveQuickEdit,
        DetailRow: props.DetailRow,
        canRowShowDetail: props.canRowShowDetail,
        columnOrder,
        setColumnOrder,
        canReorderColumns: props.canReorderColumns ?? false,
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
                {(quickEditPosition === 'top' || quickEditPosition === 'both') &&
                  <TableEditorButton
                    setEditing={setEditing}
                    canEdit={canEdit}
                  />}
                <FilterButton />
                <ColumnPickerButton />
              </div>
              {(paginate === 'top' || paginate === 'both') &&
                <Paginate
                  {...props.paginateOptions}
                  {...pagination}
                  changePage={(page) => setPagination(page)}
                  total={stateDataList.total}
              />}
            </div>
          </div>
          <div {...(props.tableWrapperProps ?? {})} className={`ts-datatable-wrapper ${props.tableWrapperProps?.className ?? ''}`}>
            <table {...(props.tableProps ?? {})} className={`ts-datatable-table ${props.tableProps?.className ?? ''}`}>
              <TableHeader />
              <TableBody
                getRowKey={props.getRowKey}
                canEditRow={props.canEditRow}
                data={stateDataList.data}
                loading={dataLoading}
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
                total={stateDataList.total}
              />
            </div>}
          <div className="ts-datatable-bottom-actions">
            {(quickEditPosition === 'bottom' || quickEditPosition === 'both') && 
              <TableEditorButton
                setEditing={setEditing}
                canEdit={canEdit}
              />}
          </div>
        </div>
      </ColumnContext.Provider>
    </React.Fragment>
  );
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
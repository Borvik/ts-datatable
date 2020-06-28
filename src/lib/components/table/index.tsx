import React, { PropsWithChildren, useState } from 'react';
import { DataTableProperties, ColumnVisibilityStorage, DataFnResult } from './types';
import { useDeepDerivedState } from '../../utils/useDerivedState';
import { useQueryState } from '../../utils/useQueryState';
import { transformColumns, getHeaderRows, getFlattenedColumns } from '../../utils/transformColumnProps';
import { useLocalState } from '../../utils/useLocalState';
import { ColumnContext } from './contexts';
import { TableHeader } from './header';
import { TableBody } from './body';
import { PageNav } from '../pagination';
import { useDeepEffect } from '../../utils/useDeepEffect';

export const DataTable = function<T>({pageNav = 'both', ...props}: PropsWithChildren<DataTableProperties<T>>) {
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

    // Now format the columns for easier use, and return as derived state
    return {
      headerRows: getHeaderRows(visibleColumns),
      actualColumns: getFlattenedColumns(visibleColumns),
    }
  }, [ props.id, columnVisibility, props.columns ]);

  const [pagination, setPagination] = useQueryState({page: 1, limit: 10}, {
    ...props.qs
  });
  
  const [stateDataList, setDataList] = useState<DataFnResult<T[]>>({ data: [], total: 0 });
  const [dataLoading, setLoading] = useState(true);
  
  useDeepEffect(() => {
    async function getData() {
      if (typeof props.data === 'function') {
        let returnedData = await props.data({ pagination });
        if (Array.isArray(returnedData)) {
          setDataList({ data: returnedData, total: returnedData.length });
        } else {
          setDataList(returnedData);
        }
      } else {
        setPagination({ limit: props.data.length });
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

    // TODO: Add search/filter/order by
  }, [ pagination ]);

  const Paginate = props.components?.Paginate ?? PageNav;

  let wrapperStyle: any = {
    '--ts-dt-fixed-bg': props.fixedColBg ?? 'white'
  };

  /**
   * Finally we setup the contexts that will house all the data
   * and pass it to all the subcomponents for eventual display.
   */
  return (
    <React.Fragment key={props.id}>
      <ColumnContext.Provider value={{
        ...columnData,
        setColumnVisibility,
      }}>
        <div id={props.id} style={wrapperStyle} {...(props.tableContainerProps ?? {})} className={`ts-datatable ts-datatable-container ${props.tableContainerProps?.className ?? ''}`}>
          <div className='ts-datatable-top-page-filters'>
            {(pageNav === 'top' || pageNav === 'both') &&
              <Paginate
                {...props.paginateOptions}
                {...pagination}
                changePage={(page) => setPagination({ page })}
                total={stateDataList.total}
            />}
          </div>
          <div {...(props.tableWrapperProps ?? {})} className={`ts-datatable-wrapper ${props.tableWrapperProps?.className ?? ''}`}>
            <table {...(props.tableProps ?? {})} className={`ts-datatable-table ${props.tableProps?.className ?? ''}`}>
              <TableHeader />
              <TableBody
                getRowKey={props.getRowKey}
                data={stateDataList.data}
                loading={dataLoading}
                LoadingComponent={props.components?.Loading}
              />
            </table>
          </div>
          {(pageNav === 'bottom' || pageNav === 'both') &&
            <div className='ts-datatable-bottom-page'>
              <Paginate
                {...props.paginateOptions}
                {...pagination}
                changePage={(page) => setPagination({ page })}
                total={stateDataList.total}
              />
            </div>}
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
import React, { PropsWithChildren, useState, useEffect } from 'react';
import { DataTableProperties, ColumnVisibilityStorage } from './types';
import { useDeepDerivedState } from '../../utils/useDerivedState';
import { transformColumns, getHeaderRows, getFlattenedColumns } from '../../utils/transformColumnProps';
import { useLocalState } from '../../utils/useLocalState';
import { ColumnContext } from './contexts';
import { TableHeader } from './header';
import { TableBody } from './body';

export const DataTable = function<T>(props: PropsWithChildren<DataTableProperties<T>>) {
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


  const [stateDataList, setDataList] = useState<T[]>([]);
  useEffect(() => {
    async function getData() {
      if (typeof props.data === 'function') {
        let returnedData = await props.data();
        setDataList(returnedData);
      } else {
        setDataList(props.data);
      }
    }
    getData();
  }, []); // TODO: Turn into useDeepEffect and memoize on pagination/search/filters

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
        <div id={props.id} {...(props.tableContainerProps ?? {})} className={`ts-datatable ts-datatable-container ${props.tableContainerProps?.className ?? ''}`}>
          <div {...(props.tableWrapperProps ?? {})} className={`ts-datatable-wrapper ${props.tableWrapperProps?.className ?? ''}`}>
            <table {...(props.tableProps ?? {})} className={`ts-datatable-table ${props.tableProps?.className ?? ''}`}>
              <TableHeader />
              <TableBody
                getRowKey={props.getRowKey}
                data={stateDataList}
              />
            </table>
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
import React, { createContext, useCallback, useContext, useState } from 'react';
import { useDeepEffect } from '../../utils/useDeepEffect';
import { useDeepMemo } from '../../utils/useDeepMemo';
import { useDerivedState } from '../../utils/useDerivedState';
import { ColumnContext } from './contexts';
import { DataFn, DataFnResult, DataProps, Pagination } from './types';

export interface TableDataContextInterface {
  loading: boolean
  data: any[];
  footerData?: any[]
  total?: number;
  refetch?: () => void;
}

export const TableDataContext = createContext<TableDataContextInterface>({
  data: [],
  loading: false,
  refetch: () => {},
});

/*

data: [] -> direct and any changes should rerender, works with footerData, total and isLoading
data: async () => [] -> result of call should rerender, no total/footerData - but manages isLoading
data: async () => {data,footer,total} -> similar to previous, but has total/footerData
data: async () => React.Element -> must render element - which should call setData to trigger re-renders

new method - wrapper - more challenging

should wrap the provider


<DataTable
  components={{
    DataProvider - default provider does above
  }}
/>

const MyProvider = ({ filters, pagination, sorts, search, BODY, children }) => {
  let apiFilters: any = undefined;
  if (filters) {
    apiFilters = translateTableFilter(filters); // turn to hook? (for rerender purposes)
  }
  return <Query
    query={gql``}
    variables={{
      filters: apiFilters
    }}
  >
    {({data, loading}) => {
      <BODY
        data={data.qry.list ?? []}
        total={data.qry.total ?? undefined}
        footerData={data.qry.footer}
        isLoading={loading}
        children={children}
      />
    }}
  </Query>
};


so... we need multiple levels here.

main table component needs a generic provider to wrap a number of it's children
the provider is given a BODY component and the table children which is itself the
  _real_ data provider
  the children include stuff like the main table rendering elements
  this must _also_ be passed to the _real_ provider for rendering

*/


export const DataProviderContent: React.FC<TableDataContextInterface> = ({
  loading,
  data,
  footerData,
  total,
  refetch,
  children,
}) => {

  // Using `useDeepMemo` to ensure same instance
  const value = useDeepMemo((): TableDataContextInterface => {
    return {
      data,
      footerData,
      total,
      loading,
      refetch,
    };
  }, [loading, total, refetch, footerData, data]);

  return <TableDataContext.Provider value={value}>
    {children}
  </TableDataContext.Provider>
}

interface TableDataArgs<T = any, FooterData = any> {
  passColumnsToQuery?: boolean
  pagination: Pagination
  hideSearchForm: boolean
  searchQuery?: null | string
  onQueryChange?: (props: DataProps<T>) => void;
  data: DataFn<T[], FooterData[]> | T[];
  totalCount?: number;
  isLoading?: boolean;
  footerData?: FooterData[];
  refetch?: () => void;
  canGroupBy: boolean
}

export interface TableDataProviderProps extends TableDataArgs {
  TableBody: React.ElementType<TableDataContextInterface>
}

export const TableDataProvider: React.FC<TableDataProviderProps> = ({
  children,
  TableBody,
  ...tableArgs
}) => {
  const {loaderElement, ...tableData} = useTableData(tableArgs);
  return (<>
    {loaderElement}
    <TableBody {...tableData}>{children}</TableBody>
  </>);
}

/**
 * This is an internal function used to resolve the table data
 */
interface TableDataResult extends TableDataContextInterface {
  loaderElement: React.ReactElement<any> | null
}

function useTableData<T, FooterData>({
  passColumnsToQuery,
  pagination,
  hideSearchForm,
  searchQuery,
  onQueryChange,
  data: propData,
  totalCount,
  isLoading: propIsLoading,
  footerData,
  refetch: propRefetch,
  canGroupBy,
}: TableDataArgs): TableDataResult {
  const {
    actualColumns,
    columnSorts,
    filter,
    setAllSelected,
  } = useContext(ColumnContext);


  const needsLoader = (typeof propData === 'function');

  const [data, setData] = useDerivedState<DataFnResult<T[], FooterData[]>>(() => ({
    data: (typeof propData === 'function') ? [] : propData,
    total: ((typeof propData === 'function') ? undefined : totalCount ?? propData.length) ?? 0,
    footerData,
    refetch: (typeof propData === 'function') ? undefined : propRefetch,
  }), [totalCount, propRefetch, footerData, propData]);
  const [isLoading, setIsLoading] = useDerivedState(() => needsLoader ? true : (propIsLoading ?? false), [needsLoader, propIsLoading]);
  const [loaderElement, setLoaderElement] = useState<React.ReactElement<any> | null>(null);
  const [rerenderCount, forceRender] = useState(1);

  const doSetData = useCallback((data: T[] | DataFnResult<T[], FooterData[]>) => {
    if (Array.isArray(data)) {
      setData({ data, total: data.length });
    } else {
      setData(data);
    }
    setIsLoading(false);
  }, [ setData, setIsLoading ]);

  // Not really "visible" columns - but columns that _could_ be part of the query
  const visibleColumnComparator = passColumnsToQuery ? actualColumns : false
  useDeepEffect(() => {
    async function getData() {
      if (typeof onQueryChange === 'function') {
        onQueryChange({
          pagination,
          search: hideSearchForm ? '' : (searchQuery ?? ''),
          sorts: columnSorts,
          filters: filter.filters.length ? filter : undefined,
          visibleColumns: actualColumns.filter(c => c.isVisible),
        });
      }

      if (typeof propData === 'function') {
        let returnedData = await propData({
          pagination,
          search: hideSearchForm ? '' : (searchQuery ?? ''),
          sorts: columnSorts,
          filters: filter.filters.length ? filter : undefined,
          visibleColumns: actualColumns.filter(c => c.isVisible),
        }, doSetData);

        if (React.isValidElement(returnedData)) {
          setLoaderElement(returnedData);
        }
        else {
          doSetData(returnedData);
        }
      }
    }

    setIsLoading(true);
    setAllSelected(false, []);
    // TODO: clear edit data (on filter/page/search)?
    getData();
  }, [rerenderCount, canGroupBy, pagination, searchQuery, columnSorts, filter, propData, hideSearchForm, visibleColumnComparator]);


  /**
   * Refetch... priority
   * 
   * 1. props.refetch (saved to data from derived state)
   * 2. callback refetch (saved to data from doSetData)
   * 3. if no refetch - use one that will toggle the effect and run getData
   */
  const fallbackRefetch = useCallback(() => { forceRender(v => 0 - v); }, [forceRender]);

  return {
    loading: isLoading,
    data: data.data,
    footerData: data.footerData,
    total: data.total,
    refetch: data.refetch ?? fallbackRefetch,
    loaderElement
  };
}
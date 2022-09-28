import React, { createContext, useCallback, useContext, useState } from 'react';
import { useDeepEffect } from '../../utils/useDeepEffect';
import { useDeepMemo } from '../../utils/useDeepMemo';
import { useDerivedState } from '../../utils/useDerivedState';
import { ColumnContext } from './contexts';
import { ColumnSort, DataFn, DataFnResult, DataProps, Pagination, QueryFilterGroup } from './types';

const EMPTY_ARRAY = [] as any[];

export interface TableDataContextInterface {
  loading: boolean
  data: any[];
  footerData?: any[]
  total?: number;
  refetch?: () => void;
  dataError?: string
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

components.DataProvider: React.Element
used like
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


export const DataProviderContent: React.FC<TableDataContextInterface> = function DataProviderContent({
  loading,
  dataError,
  data,
  footerData,
  total,
  refetch,
  children,
}) {

  // Using `useDeepMemo` to ensure same instance
  const value = useDeepMemo((): TableDataContextInterface => {
    return {
      data,
      dataError,
      footerData,
      total,
      loading,
      refetch,
    };
  }, [loading, total, dataError, refetch, footerData, data]);

  return <TableDataContext.Provider value={value}>
    {children}
  </TableDataContext.Provider>
}

interface TableDataArgs<T = any, FooterData = any> {
  passColumnsToQuery?: boolean
  pagination: Pagination
  searchQuery?: null | string
  onQueryChange?: (props: DataProps<T>) => void;
  data?: DataFn<T[], FooterData[]> | T[];
  totalCount?: number;
  isLoading?: boolean;
  footerData?: FooterData[];
  refetch?: () => void;
  canGroupBy: boolean
  filters: QueryFilterGroup
  sorts: ColumnSort[]
}

export interface TableDataProviderProps extends TableDataArgs {
  TableBody: React.ElementType<TableDataContextInterface>
  children: React.ReactNode
}

export const TableDataProvider: React.FC<TableDataProviderProps> = function TableDataProvider({
  children,
  TableBody,
  ...tableArgs
}) {
  const {loaderElement, dataNotSuppliedError, ...tableData} = useTableData(tableArgs);
  return (<>
    {loaderElement}
    <TableBody {...tableData} dataError={dataNotSuppliedError ? 'No data was supplied to the data table - either define a data prop, or a custom DataProvider' : undefined}>{children}</TableBody>
  </>);
}

/**
 * This is an internal function used to resolve the table data
 */
interface TableDataResult extends TableDataContextInterface {
  loaderElement: React.ReactElement<any> | null
  dataNotSuppliedError?: boolean
}

function useTableData<T, FooterData>({
  passColumnsToQuery,
  pagination,
  searchQuery,
  onQueryChange,
  data: propData,
  totalCount,
  isLoading: propIsLoading,
  footerData,
  refetch: propRefetch,
  canGroupBy,
  filters,
  sorts,
}: TableDataArgs): TableDataResult {
  const {
    actualColumns,
    setAllSelected,
  } = useContext(ColumnContext);

  const needsLoader = (typeof propData === 'function');
  const propDataComparator = typeof propData === 'function' ? 'function' : propData;

  const [data, setData] = useDerivedState<DataFnResult<T[], FooterData[]>>(() => ({
    data: (!propData || typeof propData === 'function') ? EMPTY_ARRAY : propData,
    total: ((typeof propData === 'function') ? undefined : totalCount ?? propData?.length) ?? 0,
    footerData,
    refetch: (typeof propData === 'function') ? undefined : propRefetch,
  }), [totalCount, propRefetch, footerData, propDataComparator]);
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
          search: searchQuery ?? '',
          sorts,
          filters: filters.filters.length ? filters : undefined,
          visibleColumns: actualColumns.filter(c => c.isVisible),
        });
      }

      if (typeof propData === 'function') {
        let returnedData = await propData({
          pagination,
          search: searchQuery ?? '',
          sorts,
          filters: filters.filters.length ? filters : undefined,
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

    if (typeof propData === 'function') {
      setIsLoading(true);
    }
    setAllSelected(false, []);
    // TODO: clear edit data (on filter/page/search)?
    getData();
  }, [rerenderCount, canGroupBy, pagination, searchQuery, sorts, filters, propDataComparator, visibleColumnComparator]);


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
    loaderElement,
    dataNotSuppliedError: !propData,
  };
}
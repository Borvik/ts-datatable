import React, { useCallback } from 'react';
import { DataProps, DataTable } from '../../library';
import { ColumnSort } from '../../library/components/table/types';
import { CommonColumns } from '../columns';
import { DataState, FOOTER_DATA, onQueryChange, Pokemon } from '../db';

const DEFAULT_SORT: ColumnSort[] = [
  {column: 'id', direction: 'asc'}
];

export function ManualDataExample({ tableRef }) {
  const [staticData, setStaticData] = React.useState<DataState>({list: [], total: 0, loading: true});
  const onQueryChangeCB = useCallback((queryProps: DataProps<Pokemon>) => onQueryChange(queryProps, setStaticData), [ setStaticData ]);

  return <DataTable<Pokemon>
    id='pokemon'
    methodRef={tableRef}
    onQueryChange={onQueryChangeCB} // Notifies of filter/pagination/search/sort changes
    data={staticData.list} // Pass Data in directly
    totalCount={staticData.total} // Total count to enable pagination
    isLoading={staticData.loading} // Allows external to show loading indicator
    fixedColBg='var(--dt-fixed-bg, white)'
    defaultSort={DEFAULT_SORT}
    columns={CommonColumns}
    footerData={FOOTER_DATA}
  />
}
import React from 'react';
import { DataTable } from '../../lib';
import { CommonColumns } from '../columns';
import { DataState, onQueryChange, Pokemon } from '../db';

export function ManualDataExample() {
  const [staticData, setStaticData] = React.useState<DataState>({list: [], total: 0, loading: true});
  
  return <DataTable<Pokemon>
    id='pokemon'
    onQueryChange={(queryProps) => onQueryChange(queryProps, setStaticData)} // Notifies of filter/pagination/search/sort changes
    data={staticData.list} // Pass Data in directly
    totalCount={staticData.total} // Total count to enable pagination
    isLoading={staticData.loading} // Allows external to show loading indicator
    fixedColBg='var(--dt-fixed-bg, white)'
    defaultSort={[
      {column: 'id', direction: 'asc'}
    ]}
    columns={CommonColumns}
  />
}
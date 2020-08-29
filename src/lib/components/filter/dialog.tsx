import React, { useRef, useContext, useState } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../dialog';
import { ColumnContext } from '../table/contexts';
import { batchedQSUpdate } from '../../utils/useQueryState';
import { FilterEditor } from './editor';

export const FilterDialog: React.FC = (props) => {
  const dialogEl = useRef<HTMLDialogElement | null>(null);
  const { filter, setFilter, setPagination } = useContext(ColumnContext);
  const [filterState, setFilterState] = useState(filter);

  return <Dialog className='filter-dialog' dialogRef={dialogEl} onSubmit={async (close) => {
    batchedQSUpdate(() => {
      setFilter(filterState);
      setPagination({ page: 1 });
    });
    close();
  }}>
    <DialogHeader>
      Filter
    </DialogHeader>
    <DialogBody>
      <FilterEditor value={filterState} onChange={setFilterState} />
    </DialogBody>
    <DialogFooter>
      <button type='button' onClick={() => { dialogEl.current?.close(); }}>Close</button>
      <button type='submit'>Apply</button>
    </DialogFooter>
  </Dialog>;
}
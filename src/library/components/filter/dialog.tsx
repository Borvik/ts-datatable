import React, { useRef, useContext, useState } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@borvik/use-dialog';
import { ColumnContext } from '../table/contexts';
import { batchedQSUpdate } from '@borvik/use-querystate';
import { FilterEditor } from './editor';

export const FilterDialog: React.FC = function FilterDialog() {
  const dialogEl = useRef<HTMLDialogElement | null>(null);
  const { filter, setFilter, setPagination, classNames, labels, doNotUseHTML5Dialog } = useContext(ColumnContext);
  const [filterState, setFilterState] = useState(filter);

  let btnCloseClass: string | undefined;
  let btnApplyClass: string | undefined;
  if (classNames?.dialogButton || classNames?.dialogCloseButton) {
    btnCloseClass = `${classNames?.dialogButton ?? ''} ${classNames?.dialogCloseButton ?? ''}`.trim();
  }
  if (classNames?.dialogButton || classNames?.dialogApplyButton) {
    btnApplyClass = `${classNames?.dialogButton ?? ''} ${classNames?.dialogApplyButton ?? ''}`.trim();
  }

  return <Dialog doNotUseHTML5Dialog={doNotUseHTML5Dialog} className='filter-dialog' dialogRef={dialogEl} onSubmit={async (close) => {
    batchedQSUpdate(() => {
      setFilter(filterState);
      setPagination({ page: 1 });
    });
    close();
  }}>
    <DialogHeader>
      {labels?.filter ?? 'Filter'}
    </DialogHeader>
    <DialogBody>
      <FilterEditor value={filterState} onChange={setFilterState} />
    </DialogBody>
    <DialogFooter>
      <button type='button' className={btnCloseClass} onClick={() => { dialogEl.current?.close(); }}>{labels?.close ?? 'Close'}</button>
      <button type='submit' className={btnApplyClass}>{labels?.apply ?? 'Apply'}</button>
    </DialogFooter>
  </Dialog>;
}
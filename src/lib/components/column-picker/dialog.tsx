import React, { useContext, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../dialog';
import { ColumnContext } from '../table/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import { useDeepDerivedState } from '../../utils/useDerivedState';
import { ColumnVisibilityStorage, DataColumn } from '../table/types';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { update } from '../../utils/immutable';

const DragHandle = SortableHandle(() => (
  <div className='column-drag'>
    <FontAwesomeIcon icon={faGripVertical} fixedWidth />
  </div>
))

interface ColumnProps {
  col: DataColumn<any>
  isVisible: boolean
  toggleVisibility: () => void
}

const ColumnEl: React.FC<ColumnProps> = ({ col, isVisible, toggleVisibility }) => {
  const { canReorderColumns } = useContext(ColumnContext);
  return <div className='config-column'>
    {canReorderColumns && <>
      {!!col.fixed && <div className='column-drag-placeholder'></div>}
      {!col.fixed && <DragHandle />}
    </>}
    <span className='column-header'>{col.header}</span>
    {!!col.canToggleVisibility && <>
      <button className='visibility-toggle' type='button' title='Toggle Visibility' onClick={() => toggleVisibility()}>
        {isVisible && <FontAwesomeIcon icon={faEye} fixedWidth />}
        {!isVisible && <FontAwesomeIcon icon={faEyeSlash} fixedWidth />}
      </button>
    </>}
  </div>
}

const SortableColumn = SortableElement(((props) => <ColumnEl {...props} />) as React.FC<ColumnProps>);

const SortableColumns = SortableContainer((({ children }) => {
  return <div className='config-column-list'>{children}</div>;
}) as React.FC)

export const ColumnPickerDialog: React.FC = () => {
  const dialogEl = useRef<HTMLDialogElement | null>(null);
  const { actualColumns, setColumnVisibility, columnOrder, setColumnOrder, classNames, labels } = useContext(ColumnContext);
  const [visible, setVisible] = useDeepDerivedState<ColumnVisibilityStorage>((prev) => {
    let newVisible: ColumnVisibilityStorage = {};
    for (let col of actualColumns) {
      newVisible[col.key] = prev?.[col.key] ?? col.isVisible;
    }
    return newVisible;
  }, [ actualColumns ]);

  const [dialogOrder, setOrder] = useState(columnOrder);

  const fixedColumns = actualColumns.filter(c => !!c.fixed);
  const fixedLeftColumns = fixedColumns.filter(c => c.fixed === 'left');
  const fixedRightColumns = fixedColumns.filter(c => c.fixed === 'right');

  const [sortedColumns] = useDeepDerivedState(() => {
    let cols = actualColumns.filter(c => !c.fixed).map(c => {
      let idx = dialogOrder.findIndex(k => k === c.key);
      if (idx < 0) return c;
      return update(c, { sortIndex: { $set: idx } });
    });

    cols.sort((a, b) => a.sortIndex - b.sortIndex);
    return cols;
  }, [dialogOrder]);

  let btnCloseClass: string | undefined;
  let btnApplyClass: string | undefined;
  if (classNames?.dialogButton || classNames?.dialogCloseButton) {
    btnCloseClass = `${classNames?.dialogButton ?? ''} ${classNames?.dialogCloseButton ?? ''}`.trim();
  }
  if (classNames?.dialogButton || classNames?.dialogApplyButton) {
    btnApplyClass = `${classNames?.dialogButton ?? ''} ${classNames?.dialogApplyButton ?? ''}`.trim();
  }

  return <Dialog dialogRef={dialogEl} onSubmit={async (close) => {
    ReactDOM.unstable_batchedUpdates(() => {
      setColumnVisibility(visible);
      setColumnOrder(dialogOrder)
    });
    close();
  }}>
    <DialogHeader>
      {labels?.columns ?? 'Columns'}
    </DialogHeader>
    <DialogBody>
      {!!fixedLeftColumns.length && <div className='config-column-list'>
        {fixedLeftColumns.map(col => {
          const isVisible = visible[col.key];
          return <ColumnEl
            key={col.key}
            col={col}
            isVisible={isVisible}
            toggleVisibility={() => setVisible(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
          />;
        })}
      </div>}
      <SortableColumns
        axis='y'
        lockAxis='y'
        useDragHandle={true}
        helperContainer={() => dialogEl.current!}
        onSortEnd={({ oldIndex, newIndex }) => {
          let keys = sortedColumns.map(c => c.key);
          let movingItem = keys[oldIndex];
          keys.splice(oldIndex, 1);
          keys.splice(newIndex, 0, movingItem);
          setOrder(keys);
        }}
      >
        {sortedColumns.map((col, index) => {
          const isVisible = visible[col.key];
          return <SortableColumn
            key={col.key}
            index={index}
            col={col}
            isVisible={isVisible}
            toggleVisibility={() => setVisible(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
          />
        })}
      </SortableColumns>
      {!!fixedRightColumns.length && <div className='config-column-list'>
        {fixedRightColumns.map(col => {
          const isVisible = visible[col.key];
          return <ColumnEl
            key={col.key}
            col={col}
            isVisible={isVisible}
            toggleVisibility={() => setVisible(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
          />;
        })}
      </div>}
    </DialogBody>
    <DialogFooter>
      <button type='button' className={btnCloseClass} onClick={() => {
        dialogEl.current?.close();
      }}>{labels?.close ?? 'Close'}</button>
      <button type='submit' className={btnApplyClass}>{labels?.apply ?? 'Apply'}</button>
    </DialogFooter>
  </Dialog>
}
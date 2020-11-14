import React, { useContext, useRef, useState } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../dialog';
import { ColumnContext } from '../table/contexts';
import { useDeepDerivedState } from '../../utils/useDerivedState';
import { ColumnSort, ColumnVisibilityStorage, DataColumn } from '../table/types';
import { update } from '../../utils/immutable';
import { DragDropContext } from 'react-beautiful-dnd';
import { OrderByList } from './orderBy';
import { GroupByList } from './groupBy';
import { ColumnDragSource } from './types';
import { isset } from '../../utils/isset';


export const ColumnPickerDialog: React.FC = () => {
  const dialogEl = useRef<HTMLDialogElement | null>(null);
  const {
    actualColumns,
    columnOrder,
    setColumnConfig,
    classNames,
    labels,
    groupBy,
    canGroupBy,
  } = useContext(ColumnContext);

  const [visible, setVisible] = useDeepDerivedState<ColumnVisibilityStorage>((prev) => {
    let newVisible: ColumnVisibilityStorage = {};
    for (let col of actualColumns) {
      newVisible[col.key] = prev?.[col.key] ?? col.isVisible;
    }
    return newVisible;
  }, [ actualColumns ]);

  const [dialogOrder, setOrder] = useState(columnOrder);
  const [dialogGroup, setGroup] = useState(groupBy);
  const [sourceDroppable, setSourceDroppable] = useState<ColumnDragSource | null>(null);

  const groupedColumns = dialogGroup.map(g => actualColumns.find(c => g.column === c.name)).filter(isset);
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

  function toggleSort(index: number) {
    let sort = dialogGroup[index];
    let col = actualColumns.find(c => c.name === sort.column);
    let newSort: ColumnSort = sort.direction === null
      ? { column: sort.column, direction: col?.defaultSortDir ?? 'asc' }
      : { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' };
    setGroup(update(dialogGroup, { [index]: { $set: newSort } }));
  }

  return <Dialog dialogRef={dialogEl} onSubmit={async (close) => {
    setColumnConfig({
      visibility: visible,
      columnOrder: dialogOrder,
      groupBy: dialogGroup,
    });
    close();
  }}>
    <DialogHeader>
      {labels?.columns ?? 'Columns'}
    </DialogHeader>
    <DialogBody className='order-by-dialog-body'>
      <DragDropContext
        onDragStart={(start) => {
          let column = actualColumns.find(c => c.key === start.draggableId)!;
          setSourceDroppable({
            column,
            sourceList: start.source.droppableId,
          });
        }}
        // onDragUpdate
        onDragEnd={(result) => {
          setSourceDroppable(null);
          /*
            result: {
              draggableId: // column.key
              type: ''?
              reason: 'DROP' | 'CANCEL'
              source: {
                droppableId: 'order-by' | 'group-by'
                index: 0 // index in source list
              }
              destination: {
                droppableId: 'order-by' | 'group-by'
                index: 0 // index to place in new lsit
              }
            }
          */
          const { destination, source, reason } = result;
          if (reason === 'CANCEL' || !destination) return;

          if (destination.droppableId === source.droppableId && destination.index === source.index)
            return;

          if (destination.droppableId === source.droppableId) {
            if (destination.droppableId === 'order-by-main') {
              // drag/drop within main list
              let keys = sortedColumns.map(c => c.key);
              let movingItem = keys[source.index];
              keys.splice(source.index, 1);
              keys.splice(destination.index, 0, movingItem);
              setOrder(keys);
            } else if (destination.droppableId === 'group-by') {
              // drag/drop within group list
              let movingItem = dialogGroup[source.index];
              setGroup(update(dialogGroup, {
                $splice: [
                  [source.index, 1],
                  [destination.index, 0, movingItem]
                ]
              }));
            }
          }
          else if (source.droppableId === 'group-by' && destination.droppableId === 'order-by-main') {
            // moving from group-by to main column list
            // remove from origin, add to main (if not fixed)
            setGroup(update(dialogGroup, { $splice: [[source.index, 1]] }));
          }
          else if (destination.droppableId === 'group-by') {
            // moving from A column list to group-by
            let col: DataColumn<any> | null = null;
            if (source.droppableId === 'order-by-fixed-left') {
              col = fixedLeftColumns[source.index];
            }
            else if (source.droppableId === 'order-by-fixed-right') {
              col = fixedRightColumns[source.index];
            }
            else if (source.droppableId === 'order-by-main') {
              col = sortedColumns[source.index];
            }

            if (!col) {
              console.warn('Unable to find source column!!!');
              return;
            }

            // determine default sort
            let newSort: ColumnSort = {column: col.name!, direction: col.defaultSortDir};
            setGroup(update(dialogGroup, { $splice: [[destination.index, 0, newSort]] }));
          }
          
          /**
           * Need complex logic
           * 
           * Fixed column, not dragged to main list or other fixed area
           *  - but _can_ to Group By
           * 
           * Grouped Columns, only draggable to main list
           *  - fixed items will auto gravitate to their area
           * 
           * Non-sortable items _cannot_ be grouped
           */
        }}
      >
        <div className='ungrouped-columns'>
          <OrderByList
            containerId='order-by-fixed-left'
            sortedColumns={fixedLeftColumns}
            visibleColumns={visible}
            setVisibleColumns={setVisible}
            dragColumn={sourceDroppable}
            isDropDisabled={true}
            isDragDisabled={!canGroupBy}
            currentGroupBy={dialogGroup}
          />
          <OrderByList
            containerId='order-by-main'
            sortedColumns={sortedColumns}
            visibleColumns={visible}
            setVisibleColumns={setVisible}
            dragColumn={sourceDroppable}
            currentGroupBy={dialogGroup}
            isDragDisabled={false}
            isDropDisabled={
              sourceDroppable !== null &&
              sourceDroppable.sourceList !== 'group-by' &&
              sourceDroppable.sourceList !== 'order-by-main'
            }
          />
          {/* <OrderByList 
            containerId='order-by-main-copy'
            sortedColumns={sortedColumns}
            visibleColumns={visible}
            setVisibleColumns={setVisible}
          /> */}
          <OrderByList
            containerId='order-by-fixed-right'
            sortedColumns={fixedRightColumns}
            visibleColumns={visible}
            setVisibleColumns={setVisible}
            dragColumn={sourceDroppable}
            isDropDisabled={true}
            isDragDisabled={!canGroupBy}
            currentGroupBy={dialogGroup}
          />
        </div>
        {canGroupBy && <GroupByList
          groupedColumns={groupedColumns}
          groupedDirections={dialogGroup}
          dragColumn={sourceDroppable}
          toggleSort={toggleSort}
          isDragDisabled={false}
        />}
      </DragDropContext>
    </DialogBody>
    <DialogFooter>
      <button type='button' className={btnCloseClass} onClick={() => {
        dialogEl.current?.close();
      }}>{labels?.close ?? 'Close'}</button>
      <button type='submit' className={btnApplyClass}>{labels?.apply ?? 'Apply'}</button>
    </DialogFooter>
  </Dialog>
}
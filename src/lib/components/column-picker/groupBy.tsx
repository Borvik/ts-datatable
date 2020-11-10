import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { DataColumn, GroupSort } from '../table/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical';
import { faSortUp } from '@fortawesome/free-solid-svg-icons/faSortUp';
import { faSortDown } from '@fortawesome/free-solid-svg-icons/faSortDown';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { ColumnDragSource } from './types';

type ToggleSortFn = (index: number) => void;

interface GroupByProps {
  groupedColumns: DataColumn<any>[];
  groupedDirections: GroupSort[];
  dragColumn: ColumnDragSource | null;
  toggleSort: ToggleSortFn
}

export const GroupByList: React.FC<GroupByProps> = ({ dragColumn, groupedDirections, toggleSort, groupedColumns }) => {

  const col = dragColumn?.column;
  const isSortable = (col?.sortable && col.colSpan === 1 && col.name);

  return (
    <Droppable
      droppableId='group-by'
      // type=''
      // ignoreContainerClipping={false} // true?
      isDropDisabled={!isSortable}
      // isCombineEnabled={true} // false? not likely
    >
      {(provided, snapshot) => {
        let classNames: string[] = ['group-by-column-list']

        if (isSortable) {
          classNames.push('is-droppable');
        }

        if (snapshot.isDraggingOver) {
          classNames.push('is-dragging-over');
        }

        return (
          <div className='group-by-container'>
            <div>Group By</div>
            <div
              ref={provided.innerRef}
              className={classNames.join(' ')}
              {...provided.droppableProps}
            >
              {groupedColumns.map((col, index) => {
                return <ColumnEl
                  key={col.key}
                  colIndex={index}
                  col={col}
                  sort={groupedDirections[index]}
                  toggleSort={toggleSort}
                />
              })}
              {provided.placeholder}
            </div>
          </div>
        )
      }}
    </Droppable>
  )
}

interface ColumnProps {
  colIndex: number
  col: DataColumn<any>
  sort: GroupSort
  toggleSort: ToggleSortFn
}

const ColumnEl: React.FC<ColumnProps> = ({ col, sort, colIndex, toggleSort }) => {
  return <Draggable
    draggableId={'grp-' + col.key}
    index={colIndex}
  >
    {(provided) => (
      <div
        className='config-column'
        {...provided.draggableProps}
        ref={provided.innerRef}
      >
        <div className='column-drag' {...provided.dragHandleProps}>
          <FontAwesomeIcon icon={faGripVertical} fixedWidth />
        </div>
        <span className='column-header'>{col.header}</span>
        <button type='button' title={`Sort `} className='toggle-sort' onClick={() => toggleSort(colIndex)}>
          {sort.direction === 'asc' && <FontAwesomeIcon icon={faSortUp} className='sort-icon' fixedWidth />}
          {sort.direction === 'desc' && <FontAwesomeIcon icon={faSortDown} className='sort-icon' fixedWidth />}
          {sort.direction === null && <FontAwesomeIcon icon={faSort} style={{opacity: .3}} className='sort-icon' fixedWidth />}
        </button>
      </div>
    )}
  </Draggable>
}
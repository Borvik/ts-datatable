import React, { useContext } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ColumnVisibilityStorage, DataColumn } from '../table/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import { ColumnContext } from '../table/contexts';
import { ColumnDragSource } from './types';

interface OrderByProps {
  containerId: string
  sortedColumns: DataColumn<any>[]
  visibleColumns: ColumnVisibilityStorage
  setVisibleColumns: (newState: ColumnVisibilityStorage | ((state: ColumnVisibilityStorage) => ColumnVisibilityStorage)) => void
  isDropDisabled: boolean
  dragColumn: ColumnDragSource | null;
}

export const OrderByList: React.FC<OrderByProps> = ({ dragColumn, containerId, isDropDisabled, sortedColumns, visibleColumns, setVisibleColumns }) => {

  return (
    <Droppable
      droppableId={containerId}
      // type=''
      // ignoreContainerClipping={false} // true?
      isDropDisabled={isDropDisabled}
      // isCombineEnabled={true} // false? not likely
      
    >
      {(provided, snapshot) => {
        let classNames: string[] = ['config-column-list']

        // if (snapshot.isDraggingOver) {
        //   classNames.push('is-droppable');
        // }

        if (!isDropDisabled && !!dragColumn) {
          classNames.push('is-droppable');
        }

        if (snapshot.isDraggingOver) {
          classNames.push('is-dragging-over');
        }

        return (
          <div
            ref={provided.innerRef}
            className={classNames.join(' ')}
            {...provided.droppableProps}
          >
            {sortedColumns.map((col, index) => {
              const isVisible = visibleColumns[col.key];
              return <ColumnEl
                key={col.key}
                colIndex={index}
                col={col}
                isVisible={isVisible}
                toggleVisibility={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
              />
            })}
            {provided.placeholder}
          </div>
        )
      }}
    </Droppable>
  )
}

interface ColumnProps {
  colIndex: number
  col: DataColumn<any>
  isVisible: boolean
  toggleVisibility: () => void
}

const ColumnEl: React.FC<ColumnProps> = ({ col, colIndex, isVisible, toggleVisibility }) => {
  const { canReorderColumns } = useContext(ColumnContext);

  return <Draggable
    draggableId={col.key}
    index={colIndex}
    isDragDisabled={!canReorderColumns}
  >
    {(provided) => (
      <div
        className='config-column'
        {...provided.draggableProps}
        {...(!canReorderColumns ? provided.dragHandleProps : {})}
        ref={provided.innerRef}
      >
        {canReorderColumns && <>
          <div className='column-drag' {...provided.dragHandleProps}>
            <FontAwesomeIcon icon={faGripVertical} fixedWidth />
          </div>
        </>}
        <span className='column-header'>{col.header}</span>
        {!!col.canToggleVisibility && <>
          <button className='visibility-toggle' type='button' title='Toggle Visibility' onClick={() => toggleVisibility()}>
            {isVisible && <FontAwesomeIcon icon={faEye} fixedWidth />}
            {!isVisible && <FontAwesomeIcon icon={faEyeSlash} fixedWidth />}
          </button>
       </>}
      </div>
    )}
  </Draggable>
}
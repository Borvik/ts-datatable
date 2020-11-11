import React, { useContext } from 'react';
import { Droppable, Draggable, DraggingStyle, NotDraggingStyle, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { ColumnSort, ColumnVisibilityStorage, DataColumn } from '../table/types';
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
  isDragDisabled: boolean
  currentGroupBy: ColumnSort[]
}

export const OrderByList: React.FC<OrderByProps> = ({ currentGroupBy, dragColumn, containerId, isDropDisabled, sortedColumns, visibleColumns, setVisibleColumns, isDragDisabled }) => {

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
                isDragDisabled={isDragDisabled}
                toggleVisibility={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                currentGroupBy={currentGroupBy}
                dragColumn={dragColumn}
              />
            })}
            {dragColumn?.sourceList === 'group-by' && <span style={{ display: 'none' }}>{provided.placeholder}</span>}
            {dragColumn?.sourceList !== 'group-by' && <>{provided.placeholder}</>}
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
  isDragDisabled: boolean
  toggleVisibility: () => void
  currentGroupBy: ColumnSort[]
  dragColumn: ColumnDragSource | null;
}

type DragStyle = DraggingStyle | NotDraggingStyle | undefined;
function getDragStyle(style: DragStyle, snapshot: DraggableStateSnapshot, dragColumn: ColumnDragSource | null) {
  if (dragColumn?.sourceList === 'group-by')
    return {};
  return style;
}

const ColumnEl: React.FC<ColumnProps> = ({ dragColumn, col, colIndex, isVisible, toggleVisibility, isDragDisabled, currentGroupBy }) => {
  const { canReorderColumns } = useContext(ColumnContext);

  let classNames: string[] = ['config-column'];
  let group = currentGroupBy.find(g => g.column === col.name);
  if (group) classNames.push('grouped');

  return <Draggable
    draggableId={col.key}
    index={colIndex}
    isDragDisabled={!canReorderColumns || isDragDisabled}
  >
    {(provided, snapshot) => (
      <div
        className={classNames.join(' ')}
        {...provided.draggableProps}
        {...(!canReorderColumns ? provided.dragHandleProps : {})}
        ref={provided.innerRef}
        style={getDragStyle(provided.draggableProps.style, snapshot, dragColumn)}
      >
        {canReorderColumns && <>
          {isDragDisabled && <div className='column-drag-placeholder' />}
          {!isDragDisabled && <div className='column-drag' {...provided.dragHandleProps}>
            <FontAwesomeIcon icon={faGripVertical} fixedWidth />
          </div>}
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
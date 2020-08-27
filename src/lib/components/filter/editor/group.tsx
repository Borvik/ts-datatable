import React, { useContext, useRef } from 'react';
import { ColumnContext } from '../../table/contexts';
import { QueryFilterGroup, isFilterGroup } from '../../table/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { FilterFieldEditor } from './field';
import {
  MenuProvider,
  Menu,
  Item as MenuItem,
  Separator as MenuSeparator
} from '../../context-menu';
import { closest } from '../../../utils/closest';
import { SetEditorStateFn } from '../types';
import { useDerivedState } from '../../../utils/useDerivedState';
import { getDefaultOperator, getDefaultValue } from '../helpers';

interface Props {
  path?: number[];
  value: QueryFilterGroup;
  setState: SetEditorStateFn;
}

export const FilterGroupEditor: React.FC<Props> = ({ value, path, setState }) => {
  const { filterSettings, actualColumns } = useContext(ColumnContext);
  const groupEl = useRef<HTMLDivElement>(null);

  const [{
    allowNested,
    allowOr,
    canAddCondition,
    canLimitConditions,
    availableColumns,
  }] = useDerivedState(() => {
    const filterableColumns = actualColumns.filter(c => !!c.filter);
    const allowOr = filterSettings?.allowOr ?? false;
    const allowNested = filterSettings?.allowNested ?? false;
    const limitOneColumnUse = filterSettings?.limitOneColumnUse ?? false;
    const canLimitConditions = (!allowNested && limitOneColumnUse);
    let canAddCondition: boolean = true;
    let availableColumns = filterableColumns;
    
    if (canLimitConditions) {
      canAddCondition = value.filters.length < filterableColumns.length;
      availableColumns = filterableColumns.filter(c => {
        return !value.filters.find(f => {
          if (isFilterGroup(f)) return false;
          return c.filter!.filterKey! === f.column;
        });
      });
    }

    return {
      allowNested,
      allowOr,
      canAddCondition,
      canLimitConditions,
      availableColumns,
    }
  }, [actualColumns, filterSettings, value]);
  
  const currentPath = path ?? [];
  const currentPathAsString = currentPath.join(',');
  
  function setGroupCondition(operator: QueryFilterGroup['groupOperator']) {
    setState(currentPath, { groupOperator: { $set: operator } });
  }

  function addGroup() {
    setState(currentPath, { filters: { $push: [{groupOperator: 'and', filters: []}]} });
  }

  function removeGroup() {
    if (!currentPath.length) {
      // top-level
      setState(currentPath, { filters: { $set: [] }});
    } else {
      let upPath = [...currentPath];
      let lastIdx = upPath.pop()!;
      setState(upPath, { filters: { $splice: [[lastIdx, 1]] }})
    }
  }

  function addCondition() {
    // get first available column and set it
    let column = availableColumns?.[0];
    if (!column) {
      console.error('Failed to find available column to add as default condition');
      return;
    }
    setState(currentPath, {
      filters: {  $push: [{
        column: column.filter!.filterKey!,
        value: getDefaultValue(column.filter),
        operator: getDefaultOperator(column.filter)
      }] }
    });
  }

  return <div ref={groupEl} className='filter-group'>
    <div className='filter-group-options'>
      {(allowNested || allowOr)  && <>
        <MenuProvider id={`group_menu_${currentPathAsString}`} className={`filter-group-operator filter-group-operator-${value.groupOperator}`} event='onClick'>
          {value.groupOperator === 'and' && 'And'}
          {value.groupOperator === 'or' && 'Or'}
        </MenuProvider>
        <Menu
          id={`group_menu_${currentPathAsString}`}
          renderTarget={() => closest(groupEl.current, 'dialog')}
          position='bottom-left'
          animation='zoom'
        >
          {allowOr && <>
            <MenuItem onClick={() => setGroupCondition('and')}>And</MenuItem>
            <MenuItem onClick={() => setGroupCondition('or')}>Or</MenuItem>
            {(allowNested || canAddCondition) && <MenuSeparator />}
          </>}
          {allowNested && <MenuItem onClick={() => addGroup()}>Add Group</MenuItem>}
          {canAddCondition && <MenuItem onClick={() => addCondition()}>Add Condition</MenuItem>}
          {allowNested && <>
            <MenuSeparator />
            <MenuItem onClick={() => removeGroup()}>Remove</MenuItem>
          </>}
        </Menu>
      </>}
      {canAddCondition && <button type='button' className='filter-group-add-btn filter-btn' data-noautofocus onClick={() => addCondition()}>
        <FontAwesomeIcon icon={faPlusCircle} />
      </button>}
    </div>
    <div className='filter-group-filters'>
      {value.filters.map((filter, idx) => {
        let newPath = [...currentPath, idx];
        return isFilterGroup(filter)
          ? <FilterGroupEditor key={newPath.join(',')} setState={setState} value={filter} path={newPath} />
          : <FilterFieldEditor key={newPath.join(',')} setState={setState} groupValue={value} filter={filter} path={currentPath} index={idx} canLimitConditions={canLimitConditions} />
      })}
    </div>
  </div>
};
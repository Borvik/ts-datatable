import React, { useContext, useRef } from 'react';
import { SetEditorStateFn } from '../types';
import { QueryFilterItem, QueryFilterGroup, DataColumn, AllFilterOperators, OperatorLabels, isFilterGroup } from '../../table/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import {
  MenuProvider,
  Menu,
  Item as MenuItem,
} from '../../context-menu';
import { ColumnContext } from '../../table/contexts';
import { useDerivedState } from '../../../utils/useDerivedState';
import { closest } from '../../../utils/closest';
import { FilterValueEditor } from './value-editors';
import { getAvailableOperators, getDefaultOperator, valueShouldBeArray, ValueCount, getDefaultValue } from '../helpers';
import get from 'lodash/get';

interface Props {
  path: number[];
  filter: QueryFilterItem;
  groupValue: QueryFilterGroup;
  index: number;
  setState: SetEditorStateFn;
  canLimitConditions: boolean;
}

export const FilterFieldEditor: React.FC<Props> = function FilterFieldEditor({ canLimitConditions, filter, path, index, setState, groupValue }) {
  const itemEl = useRef<HTMLDivElement>(null);
  const { filterColumns, filterSettings } = useContext(ColumnContext);
  const [{column, sortedColumns}] = useDerivedState(() => {
    return {
      column: filterColumns.find(c => c.filter?.filterKey === filter.column),
      sortedColumns: [...filterColumns]
        .filter(c => {
          if (canLimitConditions) {
            return !!c.filter && !groupValue.filters.find((f) => {
              if (isFilterGroup(f)) return false;
              return c.filter!.filterKey! === f.column;
            });
          }
          return !!c.filter
        })
        .sort((a, b) => {
          let aName = a.filter?.label ?? a.header ?? '';
          let bName = b.filter?.label ?? b.header ?? '';
          if (aName > bName) return 1;
          if (aName < bName) return -1;
          return 0;
        })
    }
  }, [filterColumns, filter, canLimitConditions, groupValue])

  const currentPath = [...(path ?? []), index];
  const currentPathAsString = currentPath.join(',');

  let availableOperators: AllFilterOperators[] = getAvailableOperators(column?.filter);

  /**
   * Unlike the group - PATH is the _group_ path, all operations must include self index
   */
  function remove() {
    setState(path, { filters: { $splice: [[index, 1]] } });
  }

  async function setColumn(col: DataColumn<any>) {
    let defaultOp = getDefaultOperator(col.filter);
    let defaultValue = getDefaultValue(defaultOp, col.filter);
    let columnMeta: any = undefined;
    if (typeof col.filter?.onChosen === 'function') {
      let chosenResult = await col.filter.onChosen({ op: defaultOp, value: defaultValue, column: col, isEdit: false });
      if (chosenResult) {
        if (typeof chosenResult.op !== 'undefined')
          defaultOp = chosenResult.op;
        if (typeof chosenResult.value !== 'undefined')
          defaultValue = chosenResult.value;
        if (typeof chosenResult.metadata !== 'undefined')
          columnMeta = chosenResult.metadata;
      }
    }
    setState(path, {
      filters: {
        [index]: {
          column: { $set: col.filter!.filterKey! },
          operator: { $set: defaultOp },
          value: { $set: defaultValue },
          meta: { $set: typeof columnMeta !== 'undefined' ? columnMeta : undefined },
        }
      }
    });
  }

  async function setMetadata() {
    if (typeof column?.filter?.onChosen !== 'function') {
      return;
    }

    let chosenResult = await column.filter.onChosen({ op: filter.operator, value: filter.value, column, metadata: filter.meta, isEdit: true });
    if (!chosenResult) {
      return;
    }

    let filterSpec: any = { };
    if (typeof chosenResult.op !== 'undefined')
      filterSpec.operator = { $set: chosenResult.op };
    if (typeof chosenResult.value !== 'undefined')
      filterSpec.value = { $set: chosenResult.value };
    if (typeof chosenResult.metadata !== 'undefined')
      filterSpec.meta = { $set: chosenResult.metadata };

    if (!Object.keys(filterSpec)) return;
    
    setState(path, {
      filters: {
        [index]: filterSpec
      }
    });
  }

  function setOperator(op: AllFilterOperators) {
    let filterSpec: any = { operator: { $set: op } };

    let arrayType = valueShouldBeArray(op);
    let isArray = Array.isArray(filter.value);
    if (arrayType === ValueCount.SingleValue && isArray) {
      if (filter.value.length)
        filterSpec.value = { $set: filter.value[0] };
      else
        filterSpec.value = { $set: null };
    }
    else if (arrayType === ValueCount.NoValue) {
      filterSpec.value = { $set: null };
    }
    else if (arrayType !== ValueCount.SingleValue) {
      if (arrayType === ValueCount.DualValue) {
        if (!isArray) {
          if (typeof filter.value === 'undefined' || filter.value === null)
            filterSpec.value = { $set: [null, null] }
          else
            filterSpec.value = { $set: [filter.value, null] }
        } else {
          if (filter.value.length !== 2) {
            filterSpec.value = { $set: [filter.value?.[0] ?? null, filter.value?.[1] ?? null] }
          }
        }
      }
      else if (arrayType === ValueCount.ManyValue && !isArray) {
        if (typeof filter.value === 'undefined' || filter.value === null)
          filterSpec.value = { $set: [null] }
        else
          filterSpec.value = { $set: [filter.value] }
      }
    }

    setState(path, {
      filters: {
        [index]: filterSpec
      }
    });
  }

  let metaLabel = undefined;
  if (column) {
    if (typeof column.filter?.metaToDisplay === 'string') {
      if (!column.filter.metaToDisplay) {
        // empty string - use root
        if (filter.meta) metaLabel = filter.meta;
      }
      else {
        let display = get(filter.meta, column.filter.metaToDisplay);
        if (metaLabel) metaLabel = display;
      }
    }
  }

  return <div ref={itemEl} className='filter-item-editor'>
    <MenuProvider event='onClick' id={`filter_column_menu_${currentPathAsString}`} className={`filter-column`}>
      {column?.filter?.label ?? column?.header ?? <span className="no-column">Choose Column</span>}
    </MenuProvider>
    <Menu
      id={`filter_column_menu_${currentPathAsString}`}
      renderTarget={() => closest(itemEl.current, 'dialog, .dialog')}
      position='bottom-left'
      animation='zoom'
    >
      {sortedColumns.map(c => <MenuItem key={c.key} onClick={() => setColumn(c)}>{c?.filter?.label ?? c?.header ?? ''}</MenuItem>)}
    </Menu>

    {!!metaLabel && <span className='filter_column_meta_label' onClick={() => setMetadata()}>{metaLabel}</span>}

    <MenuProvider event='onClick' id={`filter_operator_menu_${currentPathAsString}`} className={`filter-operator`}>
      {filterSettings?.operatorLabels?.[filter.operator] ?? OperatorLabels[filter.operator]}
    </MenuProvider>
    {!!availableOperators.length && <>
      <Menu
        id={`filter_operator_menu_${currentPathAsString}`}
        renderTarget={() => closest(itemEl.current, 'dialog, .dialog')}
        position='bottom-left'
        animation='zoom'
      >
        {availableOperators.map(op => (
          <MenuItem key={op} onClick={() => setOperator(op)}>{filterSettings?.operatorLabels?.[op] ?? OperatorLabels[op]}</MenuItem>
        ))}
      </Menu>
    </>}
    <div className='filter-value'>
      <FilterValueEditor column={column} filter={filter} path={path} index={index} setState={setState} />
    </div>
    <button type='button' data-noautofocus className='filter-item-remove-btn filter-btn' onClick={() => remove()}>
      <FontAwesomeIcon icon={faTimesCircle} />
    </button>
  </div>;
};
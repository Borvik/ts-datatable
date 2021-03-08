import React, { useContext } from 'react';
import { ColumnContext } from '../../table/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { useDialog } from '@borvik/use-dialog';
import { FilterDialog } from '../dialog';
import { QuickFilterGroup } from './group';
import { QuickBarContext } from './context';
import { batchedQSUpdate } from '@borvik/use-querystate';
import { QueryFilterGroup } from '../../table/types';
import { update } from '../../../utils/immutable';
import get from 'lodash/get';

// Test url: http://localhost:3000/?filter=(id:1),(id:1;op:nul),(or:(id:3,4;op:bet),(id:5,6,7;op:any)),(and:(id:9))

export const FilterBar: React.FC = function FilterBar() {
  const { dialog, showDialog } = useDialog(<FilterDialog />);
  const { filter, setFilter, setPagination, onShowFilterEditor } = useContext(ColumnContext);

  if (!filter.filters.length) return <></>;

  function applyFilter(filterState: QueryFilterGroup) {
    batchedQSUpdate(() => {
      setFilter(filterState);
      setPagination({ page: 1 });
    });
  }
  
  async function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      if (onShowFilterEditor) {
        await onShowFilterEditor(filter, applyFilter, e.currentTarget);
      } else {
        await showDialog();
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  function removeAtPath(path: number[], valueIdx?: number) {
    // perform immutable `update`
    let newFilter: QueryFilterGroup | null = null;
    let getPath: any[] = [];

    if (typeof valueIdx !== 'number') {
      // field/group removal
      let $spec: any = { filters: { $set: [] } };
      if (path.length) {
        let fieldGroupIdx = path.pop()!;
        $spec = { filters: { $splice: [[fieldGroupIdx, 1]] } };
        getPath.unshift('filters');

        if (path.length) {
          for (let i = path.length - 1; i >= 0; i--) {
            let idx = path[i];
            $spec = { filters: { [idx]: $spec } };
            getPath.unshift('filters', idx);
          }
        }
      }

      // newFilter will be an immutable copy of filter
      // from here we can make mutable changes to newFilter
      // before sending to the setFilter function
      newFilter = update(filter, $spec);
    } else {
      // value removal from multi-value field
      let fieldGroupIdx = path.pop()!;
      let $spec: any = { filters: { [fieldGroupIdx]: { value: { $splice: [[valueIdx, 1]] } } } };
      getPath.unshift('filters', fieldGroupIdx, 'value');

      if (path.length) {
        for (let i = path.length - 1; i >= 0; i--) {
          let idx = path[i];
          $spec = { filters: { [idx]: $spec } };
          getPath.unshift('filters', idx);
        }
      }

      newFilter = update(filter, $spec);
    }

    // check if we cleared all filters
    while (getPath.length) {
      // check filters at path
      let arr: any[] = get(newFilter, getPath);
      if (!arr.length) {
        getPath.pop();
        if (!getPath.length) {
          newFilter = { groupOperator: 'and', filters: [] };
        } else {
          newFilter = removeDeepArray(newFilter, getPath);
        }
      }
      // pop two off getPath
      getPath.pop(); getPath.pop();
    }

    if (!newFilter) {
      newFilter = { groupOperator: 'and', filters: [] };
    }

    batchedQSUpdate(() => {
      setFilter(newFilter!)
      setPagination({ page: 1 });
    });
  }

  return <div className='filter-bar'>
    {dialog}
    <button type='button' onClick={onButtonClick}>
      <FontAwesomeIcon icon={faFilter} />
    </button>
    <div className="quick-filter">
      <QuickBarContext.Provider value={{ removeAtPath }}>
        <QuickFilterGroup topLevel={true} value={filter} />
      </QuickBarContext.Provider>
    </div>
  </div>
}

/**
 * Utility function to remove the specified element from the
 * array it is in. Path should be a lodash compatible path
 * to the specific element to remove, and the next to last
 * element in the path is the array to remove it from.
 */
function removeDeepArray(obj: any, path: any[]) {
  // keep path immutable to avoid changing the param reference
  let workingPath: any[] = [...path];
  let idxToRemove = workingPath.pop();

  let $spec: any = { $splice: [[idxToRemove, 1]] };

  for (let i = workingPath.length - 1; i >= 0; i--) {
    let idx = workingPath[i];
    $spec = { [idx]: $spec };
  }
  
  return update(obj, $spec);
}
import React, { useState, useMemo, useContext } from 'react';
import { PaginateProps, PaginateButtonProps, PaginateLimitSelectProps, PageChange } from './types';
import uniqueId from 'lodash/uniqueId';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { faWindowMinimize } from '@fortawesome/free-solid-svg-icons/faWindowMinimize';
import { useDerivedState } from '../../utils/useDerivedState';
import { ColumnContext, useTableSelector } from '../table/contexts';
import isEqual from 'lodash/isEqual';

/**
 * Guidelines
 * 
 * Buttons Together option - keep buttons together before/after Displayed Page data
 *    - or split, prev on left, next on right...
 * Enable/Disable First/Last buttons
 * Edit in place - no reliance on bootstrap popovers
 *    - button triggers edit form, styled in place so it doesn't move (too much anyway)
 */
export const PageNav: React.FC<PaginateProps> = function PageNav({buttonPosition = 'split', perPageOptions = 'default', perPageLoc = 'before', ...props}) {
  const [id] = useState(uniqueId('pageSelect_'));
  const [editing, setEditing] = useState(false);
  const [pageNum, setPageNum] = useDerivedState(() => props.page, [props.page, editing]);
  const { labels } = useContext(ColumnContext);
  const [{
    isEditing,
    editMode,
  }] = useTableSelector(c => ({
    isEditing: c.isEditing,
    editMode: c.editMode,
  }), isEqual);

  let totalPages: number = 0;
  if (typeof props.total !== 'undefined') {
    totalPages = (Math.ceil(props.total / props.perPage) || 1);
  }

  function gotoPage() {
    if (!Number.isNaN(pageNum) && pageNum !== props.page) {
      props.changePage({ page: pageNum });
    }
    setEditing(false);
  }

  return <div key={id} className='ts-pagination'>
    <div className='ts-pagination-nav'>
      {perPageLoc === 'before' && <PerPageLimitSelect total={props.total ?? -1} totalPages={totalPages} page={props.page} changePage={props.changePage} perPage={props.perPage} perPageOptions={perPageOptions} />}
      <PaginateButtons
        {...props}
        position='before'
        buttonPosition={buttonPosition}
        totalPages={totalPages}
      />
      <span className="ts-paginate-label">{labels?.page ?? 'Page'} <>
        {!editing && <span className='ts-paginate-current-page' onClick={isEditing && editMode === 'default' ? undefined : () => setEditing(true)}>{props.page}</span>}
        {editing && <>
          <input
            className='ts-paginate-goto-page'
            ref={(ref) => ref?.focus()}
            value={Number.isNaN(pageNum) ? '' : pageNum}
            type='number'
            min={1}
            max={totalPages}
            size={totalPages.toString().length}
            onChange={(e) => setPageNum(e.target.valueAsNumber)}
            onKeyUp={(e) => {
              let key = detectKey(e);
              if (key.isEscape) {
                setEditing(false);
              }
              else if (key.isEnter) {
                gotoPage();
              }
            }}
            onBlur={() => gotoPage()}
          />
        </>}
      </> {labels?.pageOf ?? 'of'} {totalPages}</span>
      <PaginateButtons
        {...props}
        position='after'
        buttonPosition={buttonPosition}
        totalPages={totalPages}
      />
      {perPageLoc === 'after' && <PerPageLimitSelect total={props.total ?? -1} totalPages={totalPages} page={props.page} changePage={props.changePage} perPage={props.perPage} perPageOptions={perPageOptions} />}
    </div>
    <TotalLabel {...props} />
  </div>;
};

interface TotalProps extends Pick<PaginateProps, 'totalLabel' | 'totalVisible'> {
  total?: number;
}

const TotalLabel: React.FC<TotalProps> = function TotalLabel(props) {
  if (!props.totalVisible || typeof props.total === 'undefined')
    return null;

  let label: string = 'total record(s)';
  if (props.totalLabel === false)
    label = '';
  else if (typeof props.totalLabel === 'string')
    label = props.totalLabel
  else if (props.totalLabel) {
    if (props.total === 1)
      label = props.totalLabel.singular;
    else
      label = props.totalLabel.plural;
  }
  label = ' ' + label;

  return <div className='ts-pagination-totals'>{props.total}{label}</div>;
};

const PaginateButtons: React.FC<PaginateButtonProps> = function PaginateButtons({
  showFirstLast,
  buttonClass,
  total,
  totalPages,
  position,
  buttonPosition,
  page,
  changePage,
}) {
  const { labels } = useContext(ColumnContext);
  const [{
    isEditing,
    editMode,
  }] = useTableSelector(c => ({
    isEditing: c.isEditing,
    editMode: c.editMode,
  }), isEqual);
  const displayBefore = useMemo(() => (
    ((
      position === 'before' &&
      (
        buttonPosition === 'split' ||
        buttonPosition === 'before'
      )
    ) ||
    (
      position === 'after' &&
      buttonPosition === 'after'
    )) && totalPages > 1
  ), [totalPages, position, buttonPosition]);

  const displayAfter = useMemo(() => (
    ((
      position === 'after' &&
      (
        buttonPosition === 'split' ||
        buttonPosition === 'after'
      )
    ) ||
    (
      position === 'before' &&
      buttonPosition === 'before'
    )) && totalPages > 1
  ), [totalPages, position, buttonPosition]);

  if (!total) return null;
  return <div className='ts-pagination-btn-group'>
    {displayBefore && <>
      {!!showFirstLast && <button type='button' title={labels?.first ?? 'First'} className={buttonClass} disabled={page <= 1 || (isEditing && editMode === 'default')} onClick={() => changePage({ page: 1 })}>
        <span className='fa-layers fa-fw'>
          <FontAwesomeIcon icon={faCaretLeft} fixedWidth />
          <FontAwesomeIcon icon={faWindowMinimize} fixedWidth transform={{
            size: 10,
            x: -2,
            rotate: 90
          }} />
        </span>
      </button>}
      <button type='button' title={labels?.previous ?? 'Previous'} className={buttonClass} disabled={page <= 1 || (isEditing && editMode === 'default')} onClick={() => changePage({ page: page - 1 })}>
        <FontAwesomeIcon icon={faCaretLeft} fixedWidth />
      </button>
    </>}
    {displayAfter && <>
      <button type='button' title={labels?.next ?? 'Next'} className={buttonClass} disabled={page >= totalPages || (isEditing && editMode === 'default')} onClick={() => changePage({ page: page + 1 })}>
        <FontAwesomeIcon icon={faCaretRight} fixedWidth />
      </button>
      {!!showFirstLast && <button type='button' title={labels?.last ?? 'Last'} className={buttonClass} disabled={page >= totalPages || (isEditing && editMode === 'default')} onClick={() => changePage({ page: totalPages })}>
        <span className='fa-layers fa-fw'>
          <FontAwesomeIcon icon={faCaretRight} fixedWidth />
          <FontAwesomeIcon icon={faWindowMinimize} fixedWidth transform={{
            size: 10,
            x: 2,
            rotate: 270 // 90
          }} />
        </span>
      </button>}
    </>}
  </div>;
};

const PerPageLimitSelect: React.FC<PaginateLimitSelectProps> = function PerPageLimitSelect({ page, total, totalPages, perPage, perPageOptions, changePage }) {
  const { labels } = useContext(ColumnContext);
  const [{
    isEditing,
    editMode,
  }] = useTableSelector(c => ({
    isEditing: c.isEditing,
    editMode: c.editMode,
  }), isEqual);
  const [pageLimit, setPageLimit] = useDerivedState(() => perPage, [ perPage ]);
  const pageOptions = useMemo(() => {
    if (perPageOptions === 'any') return [];

    let options: number[] = [];
    if (perPageOptions !== 'default') {
      options = [...perPageOptions];
    } else {
      options = [10, 25, 50, 75, 100, 125];
    }
    
    if (!options.includes(perPage)) {
      options.push(perPage);
      options = options.sort((a,b) => a - b);
    }

    return options;
  }, [ perPageOptions, perPage ]);

  if (perPageOptions !== 'any' && !pageOptions.length)
    return null;

  function changePerPage(limit?: number) {
    if (typeof limit === 'undefined') {
      if (Number.isNaN(pageLimit)) {
        setPageLimit(perPage);
        return;
      }
      limit = pageLimit;
    }

    let newState: Partial<PageChange> = { perPage: limit };
    if (total <= limit && page !== 1) {
      newState.page = 1;
    } else {
      let newTotalPages: number = (Math.ceil(total / limit) || 1);
      if (page > newTotalPages)
        newState.page = newTotalPages;
    }
    changePage(newState);
  }

  return <div className='per-page-select'>
    {perPageOptions === 'any' && <>
      {labels?.perPage ?? 'Per Page'}
      <input
        type='number'
        min={1}
        disabled={isEditing && editMode === 'default'}
        value={Number.isNaN(pageLimit) ? '' : pageLimit}
        onChange={(e) => { setPageLimit(e.target.valueAsNumber); }}
        onKeyUp={(e) => {
          let key = detectKey(e);
          if (key.isEscape) {
            setPageLimit(perPage);
          }
          else if (key.isEnter) {
            changePerPage();
          }
        }}
        onBlur={() => changePerPage()}
      />
    </>}
    {perPageOptions !== 'any' && <>
      {pageOptions.length > 1 && <select disabled={isEditing && editMode === 'default'} value={perPage} onChange={(e) => changePerPage(parseInt(e.target.value))}>
        {pageOptions.map(page => (
          <option key={page} value={page}>{page}</option>
        ))}
      </select>}
      {pageOptions.length === 1 && <span>{perPage} </span>}
      <span>{labels?.perPage ?? 'Per Page'}</span>
    </>}
  </div>
}

function detectKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key) {
    return {
      isEscape: (e.key === 'Escape' || e.key === 'Esc'),
      isEnter: (e.key === 'Enter')
    };
  }

  if (e.which) {
    return {
      isEscape: (e.which === 27),
      isEnter: (e.which === 13),
    };
  }

  return {
    isEscape: (e.keyCode === 27),
    isEnter: (e.keyCode === 13),
  };
}
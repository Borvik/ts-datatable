import React, { useState, useMemo } from 'react';
import { PaginateProps, PaginateButtonProps } from './types';
import uniqueId from 'lodash/uniqueId';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { faWindowMinimize } from '@fortawesome/free-solid-svg-icons/faWindowMinimize';
import { useDerivedState } from '../../utils/useDerivedState';

/**
 * Guidelines
 * 
 * Buttons Together option - keep buttons together before/after Displayed Page data
 *    - or split, prev on left, next on right...
 * Enable/Disable First/Last buttons
 * Edit in place - no reliance on bootstrap popovers
 *    - button triggers edit form, styled in place so it doesn't move (too much anyway)
 */
export const PageNav: React.FC<PaginateProps> = ({buttonPosition = 'split', ...props}) => {
  const [id] = useState(uniqueId('pageSelect_'));
  const [editing, setEditing] = useState(false);
  const [pageNum, setPageNum] = useDerivedState(() => props.page, [props.page, editing]);

  let totalPages: number = 0;
  if (typeof props.total !== 'undefined') {
    totalPages = (Math.ceil(props.total / props.perPage) || 1);
  }

  function gotoPage() {
    if (!Number.isNaN(pageNum) && pageNum !== props.page) {
      props.changePage(pageNum);
    }
    setEditing(false);
  }

  return <div key={id} className='ts-pagination'>
    <div className='ts-pagination-nav'>
      <PaginateButtons
        {...props}
        position='before'
        buttonPosition={buttonPosition}
        totalPages={totalPages}
      />
      <span>Page <>
        {!editing && <span className='ts-paginate-current-page' onClick={() => setEditing(true)}>{props.page}</span>}
        {editing && <>
          <input
            className='ts-paginate-goto-page'
            value={Number.isNaN(pageNum) ? '' : pageNum}
            type='number'
            min={1}
            max={totalPages}
            onChange={(e) => setPageNum(e.target.valueAsNumber)}
          />
          <button type='button' onClick={gotoPage}>go</button>
        </>}
      </> of {totalPages}</span>
      <PaginateButtons
        {...props}
        position='after'
        buttonPosition={buttonPosition}
        totalPages={totalPages}
      />
    </div>
    <TotalLabel {...props} />
  </div>;
};

interface TotalProps extends Pick<PaginateProps, 'totalLabel' | 'totalVisible'> {
  total?: number;
}

const TotalLabel: React.FC<TotalProps> = (props) => {
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

const PaginateButtons: React.FC<PaginateButtonProps> = ({
  showFirstLast,
  buttonClass,
  total,
  totalPages,
  position,
  buttonPosition,
  page,
  changePage,
}) => {
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
      {!!showFirstLast && <button type='button' className={buttonClass} disabled={page <= 1} onClick={() => changePage(1)}>
        <span className='fa-layers fa-fw'>
          <FontAwesomeIcon icon={faCaretLeft} fixedWidth />
          <FontAwesomeIcon icon={faWindowMinimize} fixedWidth transform={{
            size: 10,
            x: -2,
            rotate: 90
          }} />
        </span>
      </button>}
      <button type='button' className={buttonClass} disabled={page <= 1} onClick={() => changePage(page - 1)}>
        <FontAwesomeIcon icon={faCaretLeft} fixedWidth />
      </button>
    </>}
    {displayAfter && <>
      <button type='button' className={buttonClass} disabled={page >= totalPages} onClick={() => changePage(page + 1)}>
        <FontAwesomeIcon icon={faCaretRight} fixedWidth />
      </button>
      {!!showFirstLast && <button type='button' className={buttonClass} disabled={page >= totalPages} onClick={() => changePage(totalPages)}>
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
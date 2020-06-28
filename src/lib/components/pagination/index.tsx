import React, { useState, useMemo } from 'react';
import { PaginateProps, PaginateButtonProps } from './types';
import uniqueId from 'lodash/uniqueId';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { faWindowMinimize } from '@fortawesome/free-solid-svg-icons/faWindowMinimize';

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

  let totalPages: number = 0;
  if (typeof props.total !== 'undefined') {
    totalPages = (Math.ceil(props.total / props.limit) || 1);
  }

  return <div key={id} className='ts-pagination'>
    <PaginateButtons
      {...props}
      position='before'
      buttonPosition={buttonPosition}
      totalPages={totalPages}
    />
    <span>Page {props.page} of {totalPages}</span>
    <PaginateButtons
      {...props}
      position='after'
      buttonPosition={buttonPosition}
      totalPages={totalPages}
    />
  </div>;
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
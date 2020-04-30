import React, { useContext } from 'react';
import { PaginationContext } from '../table/contexts';
/**
 * Guidelines
 * 
 * Buttons Together option - keep buttons together before/after Displayed Page data
 *    - or split, prev on left, next on right...
 * Enable/Disable First/Last buttons
 * Edit in place - no reliance on bootstrap popovers
 *    - button triggers edit form, styled in place so it doesn't move (too much anyway)
 */
export const PageNav: React.FC<any> = (props) => {
  const context = useContext(PaginationContext);
  return <div>Pages: {context.page}</div>;
};
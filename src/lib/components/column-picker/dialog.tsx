import React, { useContext, useRef } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../dialog';
import { ColumnContext } from '../table/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import { useDeepDerivedState } from '../../utils/useDerivedState';
import { ColumnVisibilityStorage } from '../table/types';

export const ColumnPickerDialog: React.FC = (props) => {
  const dialogEl = useRef<HTMLDialogElement | null>(null);
  const { actualColumns, setColumnVisibility } = useContext(ColumnContext);
  const [visible, setVisible] = useDeepDerivedState<ColumnVisibilityStorage>((prev) => {
    let newVisible: ColumnVisibilityStorage = {};
    for (let col of actualColumns) {
      newVisible[col.key] = prev?.[col.key] ?? col.isVisible;
    }
    return newVisible;
  }, [ actualColumns ]);

  return <Dialog dialogRef={dialogEl} onSubmit={async (close) => {
    setColumnVisibility(visible);
    close();
  }}>
    <DialogHeader>
      Columns
    </DialogHeader>
    <DialogBody>
      <div className='config-column-list'>
        {actualColumns.map(col => {
          const isVisible = visible[col.key];
          if (!col.canToggleVisibility) return null;

          return <div key={col.key} className='config-column'>
            <span className='column-header'>{col.header}</span>
            <button className='visibility-toggle' type='button' title='Toggle Visibility' onClick={() => {
              setVisible(prev => ({ ...prev, [col.key]: !prev[col.key] }))
            }}>
              {isVisible && <FontAwesomeIcon icon={faEye} fixedWidth />}
              {!isVisible && <FontAwesomeIcon icon={faEyeSlash} fixedWidth />}
            </button>
          </div>;
        })}
      </div>
    </DialogBody>
    <DialogFooter>
      <button type='button' onClick={() => {
        dialogEl.current?.close();
      }}>Close</button>
      <button type='submit'>Apply</button>
    </DialogFooter>
  </Dialog>
}
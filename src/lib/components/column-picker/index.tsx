import React, { useContext, useRef } from 'react';
import { useDialog } from '../dialog';
import { ColumnContext } from '../table/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { ColumnPickerDialog } from './dialog';

export const ColumnPickerButton: React.FC = (props) => {
  const { dialog, showDialog } = useDialog(<ColumnPickerDialog />);
  const { actualColumns, setColumnVisibility, onShowColumnPicker } = useContext(ColumnContext);

  async function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    // if custom function, call that - otherwise - showDialog
    try {
      if (onShowColumnPicker) {
        await onShowColumnPicker(actualColumns, setColumnVisibility, e.currentTarget);
      } else {
        await showDialog()
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  return <>
    {dialog}
    <button type='button' onClick={onButtonClick}>
      <FontAwesomeIcon icon={faCog} />
    </button>
  </>;
}
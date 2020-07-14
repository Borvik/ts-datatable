import React from 'react';
import { useDialog } from '../dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { ColumnPickerDialog } from './dialog';

export const ColumnPickerButton: React.FC = (props) => {
  const {dialog, showDialog} = useDialog(<ColumnPickerDialog />);

  async function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    // if custom function, call that - otherwise - showDialog
    try {
      await showDialog()
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
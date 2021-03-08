import React, { useContext } from 'react';
import { useDialog } from '@borvik/use-dialog';
import { ColumnContext } from '../table/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { ColumnPickerDialog } from './dialog';

export const ColumnPickerButton: React.FC = function ColumnPickerButton() {
  const { dialog, showDialog } = useDialog(<ColumnPickerDialog />);
  const {
    actualColumns,
    setColumnConfig,
    onShowColumnPicker,
    classNames,
    labels,
    components,
  } = useContext(ColumnContext);

  async function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      if (onShowColumnPicker) {
        await onShowColumnPicker(actualColumns, setColumnConfig, e.currentTarget);
      } else {
        await showDialog()
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  let btnSettingsClass: string | undefined;
  if (classNames?.actionButton || classNames?.actionButtonSettings) {
    btnSettingsClass = `${classNames?.actionButton ?? ''} ${classNames?.actionButtonSettings ?? ''}`.trim();
  }

  const CustomButton = components?.Buttons?.ColumnPicker;

  return <>
    {dialog}
    {!!CustomButton && <CustomButton onClick={onButtonClick} />}
    {!CustomButton && <button type='button' title={labels?.settings ?? 'Settings'} className={btnSettingsClass} onClick={onButtonClick}>
      <FontAwesomeIcon icon={faCog} />
    </button>}
  </>;
}
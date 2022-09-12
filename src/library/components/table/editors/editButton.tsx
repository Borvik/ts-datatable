import React, { useContext } from 'react';
import { ColumnContext, useTableSelector } from '../contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import isEqual from 'lodash/isEqual';
import { useSaveQuickEdit } from '../useSaveQuickEdit';

interface ButtonProps {
  canEdit: boolean
}

export const TableEditorButton: React.FC<ButtonProps> = function TableEditorButton({ canEdit }) {
  const onSaveQuickEdit = useSaveQuickEdit();
  const {
    classNames,
    labels,
  } = useContext(ColumnContext);
  const [
    {
      isEditing,
      editMode,
      editData,
      isSavingQuickEdit,
    },
    setCtxData
  ] = useTableSelector(c => ({
    isEditing: c.isEditing,
    editMode: c.editMode,
    editData: c.editData,
    isSavingQuickEdit: c.isSavingQuickEdit,
  }), isEqual);

  if (editMode === 'autosave') return null;

  if (!isEditing && editMode === 'default') {
    if (canEdit) {
      let btnEditClass: string | undefined;
      if (classNames?.actionButton || classNames?.actionButtonEdit)
        btnEditClass = `${classNames?.actionButton ?? ''} ${classNames?.actionButtonEdit ?? ''}`.trim();
      
      return <div className='quick-edit-btn-group'>
        <button type='button' className={btnEditClass} onClick={() => setCtxData({ isEditing: true })} title={labels?.quickEdit ?? 'Quick Edit'}>
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
      </div>;
    }
    return null;
  }

  let btnDiscardClass: string | undefined;
  let btnSaveClass: string | undefined;
  if (classNames?.actionButton || classNames?.actionButtonDiscard) {
    btnDiscardClass = `${classNames?.actionButton ?? ''} ${classNames?.actionButtonDiscard ?? ''}`.trim();
  }
  if (classNames?.actionButton || classNames?.actionButtonSave) {
    btnSaveClass = `${classNames?.actionButton ?? ''} ${classNames?.actionButtonSave ?? ''}`.trim();
  }
  if (Object.keys(editData).length) {
    btnSaveClass = `${btnSaveClass ?? ''} is-dirty`;
  }

  return <div className='quick-edit-btn-group editing'>
    <label>{labels?.quickEdit ?? 'Quick Edit'}</label>
    <button type='button' className={btnSaveClass} title={labels?.saveChanges ?? 'Save Changes'} disabled={isSavingQuickEdit} onClick={() => {
      onSaveQuickEdit(editData as any)
    }}>
      <FontAwesomeIcon icon={faSave} />
    </button>
    <button type='button' className={btnDiscardClass} title={labels?.discardChanges ?? 'Discard Changes'} disabled={isSavingQuickEdit} onClick={() => {
      setCtxData({
        editData: {},
        isEditing: false
      });
    }}>
      <FontAwesomeIcon icon={faBan} />
    </button>
  </div>;
}
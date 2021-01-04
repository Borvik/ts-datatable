import React, { useContext } from 'react';
import { ColumnContext } from '../contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';

interface ButtonProps {
  setEditing: (value: React.SetStateAction<boolean>) => void
  canEdit: boolean
}

export const TableEditorButton: React.FC<ButtonProps> = ({ setEditing, canEdit }) => {
  const {
    isEditing,
    editMode,
    setFormData,
    onSaveQuickEdit,
    editData,
    isSavingQuickEdit,
    classNames,
    labels,
  } = useContext(ColumnContext);

  if (editMode === 'autosave') return null;

  if (!isEditing && editMode === 'default') {
    if (canEdit) {
      let btnEditClass: string | undefined;
      if (classNames?.actionButton || classNames?.actionButtonEdit)
        btnEditClass = `${classNames?.actionButton ?? ''} ${classNames?.actionButtonEdit ?? ''}`.trim();
      
      return <div className='quick-edit-btn-group'>
        <button type='button' className={btnEditClass} onClick={() => setEditing(true)} title={labels?.quickEdit ?? 'Quick Edit'}>
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

  return <div className='quick-edit-btn-group editing'>
    <label>{labels?.quickEdit ?? 'Quick Edit'}</label>
    <button type='button' className={btnSaveClass} title={labels?.saveChanges ?? 'Save Changes'} disabled={isSavingQuickEdit} onClick={() => {
      onSaveQuickEdit(editData as any)
    }}>
      <FontAwesomeIcon icon={faSave} />
    </button>
    <button type='button' className={btnDiscardClass} title={labels?.discardChanges ?? 'Discard Changes'} disabled={isSavingQuickEdit} onClick={() => {
      setFormData({});
      setEditing(false)
    }}>
      <FontAwesomeIcon icon={faBan} />
    </button>
  </div>;
}
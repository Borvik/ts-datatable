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
  const { isEditing, setFormData, onSaveQuickEdit, editData, isSavingQuickEdit } = useContext(ColumnContext);

  if (!isEditing) {
    if (canEdit) {
      return <div className='quick-edit-btn-group'>
        <button type='button' onClick={() => setEditing(true)} title='Quick Edit'>
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
      </div>;
    }
    return null;
  }

  return <div className='quick-edit-btn-group editing'>
    <label>Quick Edit</label>
    <button type='button' title='Save Changes' disabled={isSavingQuickEdit} onClick={() => {
      onSaveQuickEdit(editData as any)
    }}>
      <FontAwesomeIcon icon={faSave} />
    </button>
    <button type='button' title='Discard Changes' disabled={isSavingQuickEdit} onClick={() => {
      setFormData({});
      setEditing(false)
    }}>
      <FontAwesomeIcon icon={faBan} />
    </button>
  </div>;
}
import { useCallback, useContext } from "react";
import { getRowKey, getRowValue } from "../../utils/getRowKey";
import { ColumnContext, useTableContexSetter } from "./contexts";
import { TableDataContext } from "./data-provider";
import { QuickEditFormData } from "./types";

export function useSaveQuickEdit<T>() {
  const { data: currentData, refetch } = useContext(TableDataContext);
  const { actualColumns, getRowKey: propGetRowKey, propOnSaveQuickEdit, doNotUseRefetchAfterSave } = useContext(ColumnContext);
  const setCtxData = useTableContexSetter();

  const onSaveQuickEdit = useCallback(async (data: QuickEditFormData<T>) => {
    try {
      if (!!propOnSaveQuickEdit && Object.keys(data).length) {
        setCtxData({ isSavingQuickEdit: true });
        let rowsToSave = Object.keys(data);
        let originalData: QuickEditFormData<T> = {};

        for (let id of rowsToSave) {
          let rowData = currentData.find((row, idx) => getRowKey(row, idx, actualColumns, propGetRowKey) == id)!;
          originalData[id] = rowData;
        }

        await propOnSaveQuickEdit(data, originalData);
        setCtxData({ editData: {} });
        if (!doNotUseRefetchAfterSave) {
          refetch?.();
        }
      }
      setCtxData({ isEditing: false });
    }
    catch {
      // avoid unhandled exception
    }
    finally {
      setCtxData({ isSavingQuickEdit: false });
    }
  }, [ propOnSaveQuickEdit, currentData, actualColumns, setCtxData, propGetRowKey ]);

  return onSaveQuickEdit;
}
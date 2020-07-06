import React from 'react';

interface DialogProvidedValues {
  close: (result?: any) => void;
  dialog?: React.MutableRefObject<HTMLDialogElement | null>;
}

export const DialogContext = React.createContext<DialogProvidedValues>({
  close: () => {},
});

export const DialogProvider = DialogContext.Provider;
export const DialogConsumer = DialogContext.Consumer;
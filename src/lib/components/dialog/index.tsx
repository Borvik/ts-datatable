import React, { useState, useCallback, useRef, useEffect, useMemo, useContext } from 'react';
import ReactDOM from 'react-dom';
import { DialogProvider, DialogContext } from './provider';
import dialogPolyfill from 'dialog-polyfill';

const modalRoot = (typeof document !== 'undefined')
  ? document.getElementsByTagName('body').item(0)
  : null;

interface DialogProps {
  onSubmit?: (close: (result?: any) => void) => Promise<void>;
  dialogRef?: React.MutableRefObject<HTMLDialogElement | null>;
}

/**
 * Need options:
 * Click-outside to close: boolean
 */
export const Dialog: React.FC<DialogProps> = ({ onSubmit, children, dialogRef }) => {
  const [submitting, setSubmitting] = useState(false);
  const dialogEl = useRef<HTMLDialogElement | null>(null);
  const { close } = useContext(DialogContext);
  
  const dialogClose = useCallback((e: Event) => {
    if (!dialogEl.current?.returnValue) {
      close();
      return;
    }

    try {
      let val = JSON.parse(dialogEl.current!.returnValue);
      close(val);
    }
    catch {
      close(dialogEl.current?.returnValue);
    }
  }, [ close ]);

  const backdropClick = useCallback((e: MouseEvent) => {
    if (!dialogEl.current) return;
    const {top, bottom, left, right} = dialogEl.current.getBoundingClientRect();
    const { clientX, clientY } = e;
    const isInDialog = (top <= clientY && e.clientY <= bottom && left <= clientX && clientX <= right);
    if (e.target === dialogEl.current && !isInDialog) {
      dialogEl.current.close();
    }
  }, []);

  const dialogCreated = (el: HTMLDialogElement | null) => {
    if (!el || el.open) return;

    dialogPolyfill.registerDialog(el);

    dialogEl.current?.removeEventListener('close', dialogClose);
    dialogEl.current?.removeEventListener('click', backdropClick);
    dialogEl.current = el;
    if (dialogRef) {
      dialogRef.current = el;
    }
    dialogEl.current.addEventListener('close', dialogClose);
    dialogEl.current.addEventListener('click', backdropClick);
    dialogEl.current.showModal();
  };
  useEffect(() => {
    return () => {
      dialogEl.current?.removeEventListener('close', dialogClose);
      dialogEl.current?.removeEventListener('click', backdropClick);
    };
  }, [dialogClose, backdropClick]);

  if (!modalRoot)
    return null;

  return ReactDOM.createPortal(<dialog className={submitting ? 'submitting' : undefined} ref={dialogCreated}>
    {!!onSubmit && <form onSubmit={(e) => {
      e.preventDefault();
      setSubmitting(true);
      onSubmit((result?: any) => {
        if (result !== null && typeof result !== 'undefined') {
          dialogEl.current!.close(JSON.stringify(result));
          return;
        }
        dialogEl.current!.close();
      })
      .catch(() => {}) // empty catch to catch form errors
      .finally(() => {
        setSubmitting(false);
      }); // setSubmitting...
    }}>
      {children}
    </form>}
    {!onSubmit && <>
      {children}
    </>}
  </dialog>, modalRoot);  
};

type PromiseState<T> = (value?: T | PromiseLike<T> | undefined) => void;

export function useDialog<T = any>(dialog: React.ReactNode) {
  const [showing, setShowing] = useState(false);
  const refPromise = useRef<PromiseState<T> | null>(null);

  const closeDialog = useCallback((result?: any) => {
    if (refPromise.current) {
      refPromise.current(result);
    } else {
      setShowing(false)
    }
  }, []);

  const showDialog = useCallback(async (): Promise<T> => {
    setShowing(true);

    let result: T;
    while (true) {
      try {
        result = await new Promise<T>((resolve) => {
          refPromise.current = resolve;
        });

        refPromise.current = null;
        setShowing(false);
        return result;
      }
      catch (e) {
        refPromise.current = null;
      }
    }
  }, []);


  let providerValue = useMemo(() => ({
    close: closeDialog
  }), [ closeDialog ]);

  return {
    dialog: showing
      ? <DialogProvider value={providerValue}>{dialog}</DialogProvider>
      : null,
    showDialog
  };
}


/**
 * const {
 *   open
 *   close
 * } = useDialog(modal, {
 *   options
 * });
 */
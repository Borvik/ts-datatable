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
  style?: React.CSSProperties;
  className?: string;
}

const focusableItems = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]'].map(f => `${f}:not([tabindex="-1"]):not([data-noautofocus])`).join(', ');
function firstFocusable(el: Element): HTMLElement | null {
  let autofocus = el.querySelector('[autofocus], .autofocus');
  if (autofocus) return autofocus as HTMLElement;

  let focusable = el.querySelector(focusableItems);
  if (!focusable) return null;
  return focusable as HTMLElement;
}

/**
 * Need options:
 * Click-outside to close: boolean
 */
export const Dialog: React.FC<DialogProps> = ({ className, style, onSubmit, children, dialogRef }) => {
  const [submitting, setSubmitting] = useState(false);
  const { close, dialog: dialogEl } = useContext(DialogContext);
  
  const dialogClose = useCallback((e: Event) => {
    if (!dialogEl?.current?.returnValue) {
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
  }, [ close, dialogEl ]);

  const backdropClick = useCallback((e: MouseEvent) => {
    if (!dialogEl?.current) return;
    const {top, bottom, left, right} = dialogEl.current.getBoundingClientRect();
    const { clientX, clientY } = e;
    const isInDialog = (top <= clientY && e.clientY <= bottom && left <= clientX && clientX <= right);
    if (e.target === dialogEl.current && !isInDialog) {
      dialogEl.current.close();
    }
  }, [ dialogEl ]);

  const dialogCreated = (el: HTMLDialogElement | null) => {
    if (!el || el.open || !dialogEl) return;

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

    let dialogBody = dialogEl.current.querySelector('.dialog-body');
    if (dialogBody) {
      let focusable = firstFocusable(dialogBody);
      if (focusable) {
        focusable.focus();
      }
    }
    // dialogEl.current.show();

    // Notes: show() - Backdrop Click doesn't work (obviously), but neither does Esc which _is_ weird
  };
  useEffect(() => {
    return () => {
      dialogEl?.current?.removeEventListener('close', dialogClose);
      dialogEl?.current?.removeEventListener('click', backdropClick);
    };
  }, [dialogClose, backdropClick, dialogEl]);

  if (!modalRoot)
    return null;

  return ReactDOM.createPortal(<div className='dialog-container'>
    <dialog style={style} className={`${className ?? ''} ${!!onSubmit ? 'dialog-form' : ''} ${submitting ? 'submitting' : ''}`.trim()} ref={dialogCreated}>
      {!!onSubmit && <form onSubmit={(e) => {
        e.preventDefault();
        setSubmitting(true);
        onSubmit((result?: any) => {
          if (result !== null && typeof result !== 'undefined') {
            dialogEl?.current!.close(JSON.stringify(result));
            return;
          }
          dialogEl?.current!.close();
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
    </dialog>
  </div>, modalRoot);  
};

interface HeaderProps {
  showClose?: boolean;
}

export const DialogHeader: React.FC<HeaderProps> = ({ showClose = true, children }) => {
  const { dialog: dialogEl } = useContext(DialogContext);
  return <div className='dialog-header'>
    <div>
      {children}
    </div>
    {showClose && <div>
      <button type='button' className='close' onClick={() => {
        dialogEl?.current?.close();
      }}>×</button>
    </div>}
  </div>
};

export const DialogBody: React.FC = ({ children }) => {
  return <div className='dialog-body'>
    {children}
  </div>
};

export const DialogFooter: React.FC = ({ children }) => {
  return <div className='dialog-footer'>
    {children}
  </div>
};

type PromiseState<T> = (value?: T | PromiseLike<T> | undefined) => void;

export function useDialog<T = any>(dialog: React.ReactNode) {
  const [showing, setShowing] = useState(false);
  const refPromise = useRef<PromiseState<T> | null>(null);
  const dialogEl = useRef<HTMLDialogElement | null>(null);

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
    close: closeDialog,
    dialog: dialogEl,
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
import { FC, ReactNode, memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  children: ReactNode;
  renderTarget?: () => HTMLElement | null;
}

export const Portal: FC<Props> = memo(function Portal({ children, renderTarget }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [_, toggleRerender] = useState(false);

  useEffect(() => {
    let getElement = renderTarget;
    let el: HTMLElement | null = null;
    if (!!getElement) {
      el = getElement();
    }

    let createdEl = false;
    if (!el && typeof document !== 'undefined') {
      el = document.createElement('div');
      document.body.appendChild(el);
      createdEl = true;
    }
    containerRef.current = el;
    toggleRerender(p => !p);
    return () => {
      if (!!createdEl && !!el) {
        el.remove();
      }
      containerRef.current = null;
      toggleRerender(p => !p);
    }
  }, [renderTarget]);

  if (!containerRef.current) {
    return null;
  }
  return createPortal(children, containerRef.current);
});
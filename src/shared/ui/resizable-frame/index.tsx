import { type MouseEventHandler, type ReactNode, useEffect, useRef, useState } from 'react';
import { content, resizableFrame, resizeHandle, resizeHandler } from './styles.css';

const ResizableFrame = ({ children }: { children: ReactNode }) => {
  const [height, setHeight] = useState(320);
  const [drag, setDrag] = useState(false);
  const startY = useRef(0);
  const startH = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag) return;
      const delta = startY.current - e.clientY;
      const newH = Math.min(Math.max(startH.current + delta, 120), window.innerHeight * 0.8);
      setHeight(newH);
    };

    const onUp = () => {
      setDrag(false);
    };

    if (drag) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag]);

  return (
    <div className={resizableFrame} style={{ height }}>
      <ResizeHandler
        onMouseDown={e => {
          setDrag(true);
          startY.current = e.clientY;
          startH.current = height;
        }}
      />

      <div className={content}>{children}</div>
    </div>
  );
};

export { ResizableFrame };

const ResizeHandler = ({ onMouseDown }: { onMouseDown: MouseEventHandler<HTMLButtonElement> }) => {
  return (
    <button type="button" className={resizeHandler} onMouseDown={onMouseDown}>
      <div className={resizeHandle} />
    </button>
  );
};

import { type MouseEventHandler, type ReactNode, useEffect, useRef, useState } from 'react';

const ResizablePanel = ({ children }: { children: ReactNode }) => {
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
    <div
      className="fixed bottom-0 left-0 right-0 z-[10000] rounded-t-lg border-t border-gray-700 bg-gray-900 text-white shadow-2xl flex flex-col"
      style={{ height }}
    >
      <ResizeHandler
        onMouseDown={e => {
          setDrag(true);
          startY.current = e.clientY;
          startH.current = height;
        }}
      />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

export { ResizablePanel };

const ResizeHandler = ({ onMouseDown }: { onMouseDown: MouseEventHandler<HTMLDivElement> }) => {
  return (
    <div
      className="h-3 cursor-row-resize bg-gray-800 flex items-center justify-center rounded-t-lg"
      onMouseDown={onMouseDown}
    >
      <div className="h-1.5 w-8 rounded-full bg-gray-500" />
    </div>
  );
};

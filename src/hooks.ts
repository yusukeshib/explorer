import { RefObject, useLayoutEffect, useRef, useState, useEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onChange = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onChange);
    return () => {
      window.removeEventListener('resize', onChange);
    };
  }, []);

  return width;
}

export function useScrollRect(ref: RefObject<HTMLDivElement>) {
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const elem = ref.current;
    if (!elem) return;

    const onChange = () => {
      const bb = elem.getBoundingClientRect();
      setRect({
        x: bb.x,
        y: elem.scrollTop,
        width: bb.width,
        height: bb.height,
      });
    };

    onChange();

    elem.addEventListener('scroll', onChange);
    return () => {
      elem.removeEventListener('scroll', onChange);
    };
  }, []);

  return rect;
}

export const useSize = (target: RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!target.current) return;
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};

export const useEventListener = (
  eventName: string,
  handler: any,
  element = window,
) => {
  // Create a ref that stores handler
  const savedHandler = useRef<any>();
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;
      // Create event listener that calls handler function stored in ref
      const eventListener = (event: any) => savedHandler.current(event);
      // Add event listener
      element.addEventListener(eventName, eventListener);
      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element], // Re-run if eventName or element changes
  );
};

import { useEffect, useRef } from 'react';

export const useAnimationFrame = (
  callback: (time: number) => void,
  dependencyList: any[],
) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<any>();

  const animate = (time: number) => {
    callback(time);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
    //eslint-disable-next-line
  }, dependencyList);
};

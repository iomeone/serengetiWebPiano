import { useEffect, useState } from 'react';

export const useMouseState = () => {
  const [mouseState, setMouseState] = useState<'down' | 'up'>('up');
  useEffect(() => {
    document.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }, []);
  const mouseDownHandler = () => {
    setMouseState('down');
  };
  const mouseUpHandler = () => {
    setMouseState('up');
  };

  return mouseState;
};

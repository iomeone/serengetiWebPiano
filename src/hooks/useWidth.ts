import { Size, WidthMode } from 'constants/layout';
import { setWidth, setWidthMode } from 'modules/layout';
import { State } from 'modules/State';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type WidthRes = {
  width: number;
  widthMode: WidthMode;
};

export function useWidth(): WidthRes {
  const { width, widthMode } = useSelector((state: State) => state.layout);
  return { width, widthMode };
}

export function useWidthStartup() {
  const dispatch = useDispatch();

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    let mode: WidthMode = WidthMode.Desktop;
    if (width > Size.desktopMin) {
      mode = WidthMode.Desktop;
    } else if (width > Size.tabletMin) {
      mode = WidthMode.Tablet;
    } else {
      mode = WidthMode.Mobile;
    }
    dispatch(setWidth(width));
    dispatch(setWidthMode(mode));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line
  }, []);
}

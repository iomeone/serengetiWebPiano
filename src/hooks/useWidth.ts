import { Size, WidthMode } from 'constants/layout';
import { setWidth, setWidthMode } from 'modules/layout';
import { State } from 'modules/State';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type WidthRes = {
  width: number;
  widthMode: WidthMode;
};

const getWidthInfo = (): WidthRes => {
  const width = window.innerWidth;
  let mode: WidthMode = WidthMode.Desktop;
  if (width > Size.desktopMin) {
    mode = WidthMode.Desktop;
  } else if (width > Size.tabletMin) {
    mode = WidthMode.Tablet;
  } else {
    mode = WidthMode.Mobile;
  }
  return { width, widthMode: mode };
};

export function useWidth(): WidthRes {
  const { width, widthMode } = useSelector((state: State) => state.layout);
  const dispatch = useDispatch();

  useEffect(() => {
    const { width: w, widthMode: m } = getWidthInfo();
    dispatch(setWidth(w));
    dispatch(setWidthMode(m));
  }, []);
  return { width, widthMode };
}

export function useWidthStartup() {
  const dispatch = useDispatch();

  const handleResize = useCallback(() => {
    const { width: w, widthMode: m } = getWidthInfo();
    dispatch(setWidth(w));
    dispatch(setWidthMode(m));
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

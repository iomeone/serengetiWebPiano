import { Size, WidthMode } from 'constants/layout';
import { setReady, setWidth, setWidthMode } from 'modules/layout';
import { State } from 'modules/State';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type WidthRes = {
  width: number;
  widthMode: WidthMode;
};

export function useWidth(): WidthRes {
  const { ready, width, widthMode } = useSelector(
    (state: State) => state.layout,
  );
  const dispatch = useDispatch();

  // eslint-disable-next-line
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
  }, []);

  // eslint-disable-next-line
  useEffect(() => {
    if (!ready) {
      window.addEventListener('resize', handleResize);
      handleResize();
      console.log('ready');
      dispatch(setReady(true));

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return { width, widthMode };
}

import { KeyMap } from 'models/KeyMap';
import { setKeyDown, setKeyUp } from 'modules/keyboard';
import { State } from 'modules/State';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type KeyEventHandler = (key: string) => void;

export function useKeyEvent(
  onKeyDown: KeyEventHandler,
  onKeyUp: KeyEventHandler,
) {
  const keyEvent = useSelector((state: State) => state.keyboard.keyEvent);

  useEffect(() => {
    if (keyEvent === null) return;
    if (keyEvent.on) {
      onKeyDown(keyEvent.key);
    } else {
      onKeyUp(keyEvent.key);
    }
    //eslint-disable-next-line
  }, [keyEvent]);
}

export function useKeyboardStartup() {
  const dispatch = useDispatch();

  const keyDownHandler = (e: KeyboardEvent) => {
    if (!e.repeat) {
      dispatch(setKeyDown(e.key));
    }

    if (e.ctrlKey && e.code === 'KeyS') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const keyUpHandler = ({ key }: KeyboardEvent) => {
    dispatch(setKeyUp(key));
  };

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
    //eslint-disable-next-line
  }, []);
}

type UseControlKeysRes = {
  keyMap: KeyMap;
  ctrlZ: boolean;
  ctrlY: boolean;
  ctrlS: boolean;
};

export function useControlKeys(): UseControlKeysRes {
  const keyMap = useSelector((state: State) => state.keyboard.keyMap);

  const control = useMemo(() => keyMap['Control'] ?? false, [keyMap]);

  const ctrlS = useMemo(
    () => control && (keyMap['s'] ?? false),
    [keyMap, control],
  );
  const ctrlZ = useMemo(
    () => control && (keyMap['z'] ?? false),
    [keyMap, control],
  );
  const ctrlY = useMemo(
    () => control && (keyMap['y'] ?? false),
    [keyMap, control],
  );

  return {
    keyMap,
    ctrlS,
    ctrlZ,
    ctrlY,
  };
}

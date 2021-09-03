import { useEffect, useMemo, useState } from 'react';

type KeyMap = {
  [key: string]: boolean | undefined;
};

type UseControlKeysRes = {
  keys: KeyMap;
  ctrlZ: boolean;
  ctrlY: boolean;
  ctrlS: boolean;
};

export function useControlKeys(): UseControlKeysRes {
  const [keys, setKeys] = useState<KeyMap>({});

  const onKeyDown = (key: any) => {
    setKeys((ks) => ({
      ...ks,
      [key]: true,
    }));
  };
  const onKeyUp = (key: any) => {
    setKeys((ks) => ({
      ...ks,
      [key]: false,
    }));
  };

  const keyDownHandler = (e: KeyboardEvent) => {
    if (!e.repeat) {
      onKeyDown(e.key);
    }

    if (e.ctrlKey && e.code === 'KeyS') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const keyUpHandler = ({ key }: KeyboardEvent) => {
    onKeyUp(key);
  };

  const control = useMemo(() => keys['Control'] ?? false, [keys]);

  const ctrlS = useMemo(() => control && (keys['s'] ?? false), [keys, control]);
  const ctrlZ = useMemo(() => control && (keys['z'] ?? false), [keys, control]);
  const ctrlY = useMemo(() => control && (keys['y'] ?? false), [keys, control]);

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
    //eslint-disable-next-line
  }, []);

  return {
    keys,
    ctrlS,
    ctrlZ,
    ctrlY,
  };
}

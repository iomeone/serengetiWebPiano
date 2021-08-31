import { useEffect, useMemo, useState } from 'react';

type KeyMap = {
  [key: string]: boolean | undefined;
};

type UseControlKeysRes = {
  keys: KeyMap;
  ctrlZ: boolean;
  ctrlY: boolean;
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

  const keyDownHandler = ({ key, repeat }: KeyboardEvent) => {
    if (!repeat) {
      onKeyDown(key);
    }
  };

  const keyUpHandler = ({ key }: KeyboardEvent) => {
    onKeyUp(key);
  };

  const ctrlZ = useMemo(
    () => (keys['Control'] ?? false) && (keys['z'] ?? false),
    [keys],
  );
  const ctrlY = useMemo(
    () => (keys['Control'] ?? false) && (keys['y'] ?? false),
    [keys],
  );

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
    ctrlZ,
    ctrlY,
  };
}

import { usePiano } from 'hooks/usePiano';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Articulation } from 'services/IAudioService';
import styled from 'styled-components';
import { Note, noteToMidiKeyNumber } from '../utils/Note';
import Key from './Key';

const Keyboard = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
`;

type Props = {
  lower: number;
  upper: number;
  pressedKeys?: Note[];
  onPressedKeysChanged?: (pressedKeys: Note[]) => void;
};

type KeyProps = {
  midiKeyNumber: number;
  isPressed: boolean;
};
// seleced
export default function Piano({
  lower,
  upper,
  pressedKeys,
  onPressedKeysChanged,
}: Props) {
  const { play } = usePiano();

  const [myPressedKeys, setMyPressedKeys] = useState<Note[]>([]);

  const keys = useMemo<KeyProps[]>(() => {
    const length = upper - lower + 1;
    const keys = Array.from({ length }, (_, ind) => ({
      midiKeyNumber: ind + lower,
      isPressed: false,
    }));

    myPressedKeys.forEach((key) => {
      const midiKeyNumber = noteToMidiKeyNumber(key);
      if (midiKeyNumber >= lower && midiKeyNumber <= upper) {
        keys[midiKeyNumber - lower].isPressed = true;
      }
    });

    return keys;
  }, [lower, upper, myPressedKeys]);

  const changePressedKeys = useCallback(
    (keys: Note[]) => {
      setMyPressedKeys(keys);
      if (onPressedKeysChanged) {
        onPressedKeysChanged(keys);
      }
    },
    [setMyPressedKeys, onPressedKeysChanged],
  );

  useEffect(() => {
    if (pressedKeys) {
      changePressedKeys(pressedKeys);
    }
  }, [pressedKeys, changePressedKeys]);

  if (keys === null) {
    return <></>;
  }
  return (
    <Keyboard>
      {keys.map((key, id) => (
        <Key
          key={key.midiKeyNumber}
          midiKeyNumber={key.midiKeyNumber}
          isPressed={key.isPressed}
          play={(midiKeyNumber) => {
            play({
              articulation: Articulation.Legato,
              duration: 1,
              gain: 4,
              midiKeyNumber,
            });
          }}
        />
      ))}
    </Keyboard>
  );
}

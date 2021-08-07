import { usePiano } from 'hooks/usePiano';
import React, { useEffect, useMemo, useState } from 'react';
import { Articulation } from 'services/IAudioService';
import styled, { StyledComponent } from 'styled-components';
import {
  Note,
  midiKeyNumberToKeyType,
  noteToMidiKeyNumber,
} from '../utils/Note';
import Key from './Key';

const Wrap = styled.div`
  position: fixed;
  width: 100vw;
  height: 20vh;
  left: 0px;
  bottom: 0px;
`;

const KeyBoard = styled.div`
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

type Key = {
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
  const play = usePiano();

  const [myPressedKeys, setMyPressedKeys] = useState<Note[] | null>(null);

  const keys = useMemo<Key[] | null>(() => {
    if (myPressedKeys === null) return null;
    const length = upper - lower + 1;
    const keys = Array.from({ length }, (_, ind) => ({
      midiKeyNumber: ind + lower,
      isPressed: false,
    }));

    myPressedKeys.forEach((key) => {
      const midiKeyNumber = noteToMidiKeyNumber(key);
      if (midiKeyNumber >= lower && noteToMidiKeyNumber(key) <= upper) {
        keys[noteToMidiKeyNumber(key) - lower].isPressed = true;
      }
    });

    return keys;
  }, [lower, upper, myPressedKeys]);

  const changePressedKeys = (keys: Note[]) => {
    setMyPressedKeys(keys);
    if (onPressedKeysChanged) {
      onPressedKeysChanged(keys);
    }
  };

  useEffect(() => {
    if (pressedKeys) {
      changePressedKeys(pressedKeys);
    }
  }, [pressedKeys]);

  if (keys === null) {
    return <></>;
  }
  return (
    <Wrap>
      <KeyBoard>
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
      </KeyBoard>
    </Wrap>
  );
}

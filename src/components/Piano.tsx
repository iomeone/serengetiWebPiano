import { DownCircleFilled } from '@ant-design/icons';
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import { usePiano } from 'hooks/usePiano';
import { State } from 'modules/State';
import { setPianoVisibility } from 'modules/piano';
import React, { useEffect, useMemo, useState } from 'react';
import { Articulation } from 'services/IAudioService';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import {
  Note,
  midiKeyNumberToKeyType,
  noteToMidiKeyNumber,
} from '../utils/Note';
import Key from './Key';

const pianoPopUpAnimation = keyframes`
  0%{ opacity: 0; bottom: -6vh;}
  100%{ opacity: 1; bottom: 0px;}
`;

const pianoHideAnimation = keyframes`
  0%{ opacity: 1; bottom: 0px;}
  100%{ opacity: 0; bottom: -6vh;}
`;

type AnimationProps = {
  visibility: boolean;
};

const Wrap = styled.div`
  position: fixed;
  width: 100vw;
  height: 20vh;
  left: 0px;
  bottom: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation-name: ${(props: AnimationProps) =>
    props.visibility ? pianoPopUpAnimation : pianoHideAnimation};
  animation-duration: 1s;
  animation-fill-mode: forwards;
`;

const KeyBoard = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
`;

const DownArrow: React.FunctionComponent<AntdIconProps> = styled(
  DownCircleFilled,
)`
  color: #fe656a;
  font-size: 30px;
  margin-bottom: 10px;
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
  const dispatch = useDispatch();

  const [myPressedKeys, setMyPressedKeys] = useState<Note[]>([]);
  const piano = useSelector((state: State) => state.piano);

  const keys = useMemo<Key[]>(() => {
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

  const onUp = () => {
    dispatch(setPianoVisibility(false));
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
    <Wrap visibility={piano.visibility}>
      <DownArrow onTouchEnd={onUp} onMouseUp={onUp} />
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

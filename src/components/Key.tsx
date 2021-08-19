import { useMouseState } from 'hooks/useMouseState';
import { useState } from 'react';
import styled from 'styled-components';
import {
  midiKeyNumberToBetterNoteName,
  midiKeyNumberToKeyType,
} from 'utils/Note';

const WhiteKey = styled.div`
  display: flex;
  max-width: 50px;
  width: 1vw;
  flex: 1;
  align-items: end;
  background-color: white;
  border: 1px solid black;
  align-items: flex-end;
  justify-content: center;
  user-drag: none;
`;

const BlackKey = styled.div`
  position: relative;
  background: black;
  max-width: 17px;
  width: 1.5vw;
  height: 60%;
  left: -0.5vw;
  user-drag: none;
`;
const BlackKeyWrap = styled.div`
  user-select: none;
  user-drag: none;
  width: 0px;
`;

const KeyText = styled.div`
  user-select: none;
  user-drag: none;
`;

type Props = {
  midiKeyNumber: number;
  isPressed: boolean;
  play: (midiKeyNumber: number) => void;
};

export default function Key({ midiKeyNumber, isPressed, play }: Props) {
  const [myIsPressed, setMyIsPressed] = useState<boolean>(false);
  const mouseState = useMouseState();

  const onDown = () => {
    setMyIsPressed(true);
    play(midiKeyNumber);
  };

  const onUp = () => {
    setMyIsPressed(false);
  };
  if (midiKeyNumberToKeyType(midiKeyNumber)) {
    return (
      <BlackKeyWrap draggable="false">
        <BlackKey
          draggable="false"
          style={{
            backgroundColor: myIsPressed || isPressed ? '#803435' : 'black',
          }}
          onTouchStart={onDown}
          onTouchEnd={onUp}
          onMouseEnter={() => {
            if (mouseState === 'down') {
              onDown();
            }
          }}
          onMouseLeave={onUp}
          onMouseDown={onDown}
          onMouseUp={onUp}
        />
      </BlackKeyWrap>
    );
  } else {
    return (
      <WhiteKey
        draggable="false"
        style={{
          backgroundColor: myIsPressed || isPressed ? '#fe656a' : 'white',
        }}
        onTouchStart={onDown}
        onTouchEnd={onUp}
        onMouseEnter={() => {
          if (mouseState === 'down') {
            onDown();
          }
        }}
        onMouseLeave={onUp}
        onMouseDown={onDown}
        onMouseUp={onUp}
      >
        <KeyText>{midiKeyNumberToBetterNoteName(midiKeyNumber)}</KeyText>
      </WhiteKey>
    );
  }
}

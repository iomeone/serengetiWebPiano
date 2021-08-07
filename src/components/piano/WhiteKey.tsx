import { useMouseState } from 'hooks/useMouseState';
import { useEffect, useState } from 'react';
import styled, { StyledComponent } from 'styled-components';
import { midiKeyNumberToBetterNoteName } from 'utils/Note';

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
`;

const KeyText = styled.div``;

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

  return (
    <WhiteKey
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

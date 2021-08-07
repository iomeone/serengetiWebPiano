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
};

export default function Key({ midiKeyNumber, isPressed }: Props) {
  const [myIsPressed, setMyIsPressed] = useState<boolean>(false);

  useEffect(() => {
    // if true => audio
  }, [myIsPressed]);
  return (
    <WhiteKey
      style={{
        backgroundColor: myIsPressed || isPressed ? '#fe656a' : 'white',
      }}
      onTouchStart={() => {
        setMyIsPressed(true);
      }}
      onTouchEnd={() => {
        setMyIsPressed(false);
      }}
    >
      <KeyText>{midiKeyNumberToBetterNoteName(midiKeyNumber)}</KeyText>
    </WhiteKey>
  );
}

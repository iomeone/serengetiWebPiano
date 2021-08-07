import { useEffect, useState } from 'react';
import styled, { StyledComponent } from 'styled-components';

const BlackKeyWrap = styled.div`
  width: 0px;
`;

const BlackKey = styled.div`
  position: relative;
  background: black;
  width: 1.5vw;
  height: 60%;
  left: -0.75vw;
`;

type Props = {
  midiKeyNumber: number;
  isPressed: boolean;
};

export default function Key({ midiKeyNumber, isPressed }: Props) {
  const [myIsPressed, setMyIsPressed] = useState<boolean | null>(null);

  useEffect(() => {
    // if true => audio
  }, [myIsPressed]);

  return (
    <BlackKeyWrap>
      <BlackKey
        style={{
          backgroundColor: myIsPressed || isPressed ? '#803435' : 'black',
        }}
        onTouchStart={() => {
          setMyIsPressed(true);
        }}
        onTouchEnd={() => {
          setMyIsPressed(false);
        }}
      />
    </BlackKeyWrap>
  );
}

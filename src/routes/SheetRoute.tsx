import { Button } from 'antd';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'modules/State';
import Viewer from 'components/Viewer';
import { noteToMidiKeyNumber } from 'utils/Note';
import Piano from 'components/Piano';
import { setPianoVisibility } from 'modules/piano';
import LoadSheet from 'components/LoadSheet';

const margin = 20;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${margin}px 50px ${margin}px 50px;
`;

const Title = styled.div`
  margin-bottom: ${margin}px;
`;

const key = 'osmd-sheet-key';

export default function SheetRoute() {
  const piano = useSelector((state: State) => state.piano);
  const dispatch = useDispatch();

  return (
    <Main>
      <Title>
        <LoadSheet key={key}></LoadSheet>
      </Title>
      <Button
        onClick={() => {
          dispatch(setPianoVisibility(true));
        }}
      >
        피아노 열기
      </Button>
      <Viewer key={key}></Viewer>
      <Piano
        lower={noteToMidiKeyNumber(piano.min)}
        upper={noteToMidiKeyNumber(piano.max)}
      />
    </Main>
  );
}

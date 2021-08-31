import { Button, Space } from 'antd';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'modules/State';
import { noteToMidiKeyNumber } from 'utils/Note';
import Piano from 'components/Piano';
import { setPianoVisibility } from 'modules/piano';
import LoadSheet from 'components/LoadSheet';
import PianoRollViewer from 'components/PianoRollViewer';
import { Size } from 'constants/layout';
import { useKeyboardMIDI } from 'hooks/useKeyboardMIDI';

const hMargin = Size.hMargin;
const margin = Size.margin;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${margin}px ${hMargin}px ${margin}px ${hMargin}px;
`;

const Title = styled.div`
  margin-bottom: ${margin}px;
`;

const sheetKey = 'osmd-sheet-key';

export default function PianoRollRoute() {
  const piano = useSelector((state: State) => state.piano);
  const dispatch = useDispatch();
  const { pressedKeys, pressedBinaryKeys } = useKeyboardMIDI();

  return (
    <Main>
      <Title>
        <LoadSheet sheetKey={sheetKey}></LoadSheet>
      </Title>
      <Space direction="horizontal" size={8}>
        <Button
          onClick={() => {
            dispatch(setPianoVisibility(true));
          }}
        >
          피아노 열기
        </Button>
      </Space>
      <PianoRollViewer sheetKey={sheetKey}></PianoRollViewer>
      <Piano
        pressedKeys={pressedKeys}
        lower={noteToMidiKeyNumber(piano.min)}
        upper={noteToMidiKeyNumber(piano.max)}
      />
    </Main>
  );
}

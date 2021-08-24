import { Button, Space } from 'antd';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'modules/State';
import { noteToMidiKeyNumber } from 'utils/Note';
import Piano from 'components/Piano';
import { setPianoVisibility } from 'modules/piano';
import LoadSheet from 'components/LoadSheet';
import { OSMDService } from 'services/OSMDService';
import { useMemo } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { isLoadedSheet } from 'utils/Sheet';
import PianoRollViewer from 'components/PianoRollViewer';
import { Size } from 'constants/layout';

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
  const sheet = useSelector(
    (state: State) => state.audio.sheets[sheetKey] ?? null,
  );
  const osmd = useMemo(
    () => (isLoadedSheet(sheet) ? (sheet.osmd as OSMD) : null),
    [sheet],
  );

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
        <Button
          onClick={() => {
            if (osmd !== null) {
              const os = new OSMDService(osmd);
              console.log(os.getNoteSchedules());
            }
          }}
          disabled={osmd === null}
        >
          노트 스케쥴 가져오기
        </Button>
      </Space>
      <PianoRollViewer sheetKey={sheetKey}></PianoRollViewer>
      <Piano
        lower={noteToMidiKeyNumber(piano.min)}
        upper={noteToMidiKeyNumber(piano.max)}
      />
    </Main>
  );
}

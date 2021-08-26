import { Button, Typography } from 'antd';
import { State } from 'modules/State';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { isLoadedSheet } from 'utils/Sheet';
import PianoRoll, { PlayMode, PlayState } from './PianoRoll';
import Viewer from './Viewer';
import { getBPM, getNoteSchedules, getTimeSignature } from 'utils/OSMD';

type SegmentViewerProps = {
  sheetKey: string;
};

export default function PianoRollViewer({ sheetKey }: SegmentViewerProps) {
  const sheet = useSelector(
    (state: State) => state.audio.sheets[sheetKey] ?? null,
  );
  const osmd = useMemo(
    () => (isLoadedSheet(sheet) ? (sheet.osmd as OSMD) : null),
    [sheet],
  );

  const noteSchedules = useMemo(
    () => (osmd !== null ? getNoteSchedules(osmd) : null),
    [osmd],
  );
  const bpm = useMemo(() => (osmd !== null ? getBPM(osmd) : null), [osmd]);
  const timeSigniture = useMemo(
    () => (osmd !== null ? getTimeSignature(osmd) : null),
    [osmd],
  );
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#E6CDAF',
        paddingBottom: 20,
      }}
    >
      <div
        style={{
          paddingTop: 8,
          paddingLeft: 24,
          paddingBottom: 8,
          paddingRight: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography.Text
          style={{
            fontWeight: 'bold',
          }}
        >
          OSMD Viewer
        </Typography.Text>
        <Button disabled={!isLoadedSheet(sheet)}>Play Roll</Button>
      </div>
      <div
        style={{
          width: '100%',
          overflowX: 'hidden',
          overflowY: 'hidden',
          backgroundColor: 'white',
          paddingTop: 10,
        }}
      >
        <Viewer hidden={true} sheetKey={sheetKey}></Viewer>
        <PianoRoll
          noteSchedules={noteSchedules}
          bpm={bpm}
          timeSigniture={timeSigniture}
          state={PlayState.PREPARE}
          playMode={PlayMode.HOLD}
        ></PianoRoll>
      </div>
    </div>
  );
}

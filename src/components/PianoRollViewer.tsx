import { Button, Typography } from 'antd';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import { State } from 'modules/State';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { isLoadedSheet } from 'utils/Sheet';
import PianoRoll, { PlayState } from './PianoRoll';
import Viewer from './Viewer';
import { OSMDService } from 'services/OSMDService';

type SegmentViewerProps = {
  sheetKey: string;
};

export default function SegmentViewer({ sheetKey }: SegmentViewerProps) {
  const audio = useSelector((state: State) => state.audio);
  const { frontPlaybackService, getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService();

  const sheet = useSelector(
    (state: State) => state.audio.sheets[sheetKey] ?? null,
  );
  const osmd = useMemo(
    () => (isLoadedSheet(sheet) ? (sheet.osmd as OSMD) : null),
    [sheet],
  );
//TODO new 서비스 => use서비스 
  const osmdService = useMemo(()=>{
      if(osmd !== null ){
          return new OSMDService(osmd);
      } else{
          return null;
      }
  },[osmd]);

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
        <Button
          disabled={!isLoadedSheet(sheet)}
        >
          Play Roll
        </Button>
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
        {//TODO:  이 더러운 props를 바꾸는 방법 1. osmdService 자체를 넣어준다 2.
        }
        <PianoRoll
            noteSchedules={osmdService ? osmdService.getNoteSchedules() :null}
            bpm={osmdService ? osmdService.getBpm() : null}
            timeSigniture={osmdService ? osmdService.getSigniture() : null}   
            state={PlayState.PREPARE}
          ></PianoRoll>
      </div>
    </div>
  );
}

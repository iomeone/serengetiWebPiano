import { Button, Typography } from 'antd';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import { State } from 'modules/State';
import { useSelector } from 'react-redux';
import { isLoadedSheet } from 'utils/Sheet';
import Viewer from './Viewer';

type SegmentViewerProps = {
  sheetKey: string;
};
export default function SegmentViewer({ sheetKey }: SegmentViewerProps) {
  const audio = useSelector((state: State) => state.audio);
  const { frontPlaybackService, getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService();

  const sheet = audio.sheets[sheetKey] ?? null;

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
          onClick={async () => {
            let service = frontPlaybackService;
            const sheet = audio.sheets[sheetKey];
            if (frontPlaybackService === null) {
              service = await getOrCreateFrontPlaybackServiceWithGesture(
                sheet.osmd,
              );
            }
            service?.play();
          }}
          disabled={!isLoadedSheet(sheet)}
        >
          Play Audio
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
        <div
          style={{
            width: 100000,
            height: 250,
          }}
        >
          <Viewer sheetKey={sheetKey}></Viewer>
        </div>
      </div>
    </div>
  );
}

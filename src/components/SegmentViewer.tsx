import { Button, Typography } from 'antd';
import { State } from 'modules/State';
import { useSelector } from 'react-redux';
import Viewer from './Viewer';

type SegmentViewerProps = {
  key: string;
};
export default function SegmentViewer({ key }: SegmentViewerProps) {
  const audio = useSelector((state: State) => state.audio);

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
        <Button disabled={audio.sheets[key] === undefined}>Play Audio</Button>
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
          <Viewer key={key}></Viewer>
        </div>
      </div>
    </div>
  );
}

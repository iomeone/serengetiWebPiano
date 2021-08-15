import { Button, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { State } from 'modules/State';
import Viewer from 'components/Viewer';
import PlaybackEngine from 'osmd-audio-player';
import { IAudioContext } from 'standardized-audio-context';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { FrontAudioService } from 'services/FrontAudioService';
import LoadSheet from 'components/LoadSheet';

const margin = 20;

const Main = styled.div`
  padding: ${margin}px 50px ${margin}px 50px;
`;

export default function OSMDRoute() {
  const [audioService, setAudioService] = useState<FrontAudioService | null>(
    null,
  );
  const isLoaded = useMemo(() => {
    return audioService !== null;
  }, [audioService]);
  const preloadWithGesture = async (): Promise<FrontAudioService> => {
    const fas = new FrontAudioService();
    await fas.init();
    setAudioService(fas);
    return fas;
  };
  const sheet = useSelector((state: State) => state.sheet);
  const osmd = useSelector((state: State) => state.sheet.osmd) as OSMD;

  return (
    <Main>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Typography.Text>OSMD Component Test Page</Typography.Text>
        <LoadSheet></LoadSheet>
        {isLoaded ? (
          <Space direction="horizontal" size={8}>
            <CheckCircleOutlined></CheckCircleOutlined>
            <Typography.Text>Audio Service is ready.</Typography.Text>
          </Space>
        ) : (
          <Space direction="horizontal" size={8}>
            <ExclamationCircleOutlined></ExclamationCircleOutlined>
            <Typography.Text>Audio Service is not loaded.</Typography.Text>
          </Space>
        )}
        <Button
          onClick={() => {
            preloadWithGesture();
          }}
        >
          preload audio service
        </Button>
        <Button
          onClick={async () => {
            const engine = new PlaybackEngine(
              FrontAudioService.AudioContext as IAudioContext,
            );
            await engine.loadScore(osmd as any);
            engine.setBpm(120);
            engine.play();
          }}
          disabled={!isLoaded || sheet.sheet === null}
        >
          play loaded musicxml file
        </Button>
        <Viewer></Viewer>
      </Space>
    </Main>
  );
}

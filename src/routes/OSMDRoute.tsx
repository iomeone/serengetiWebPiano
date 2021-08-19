import { Button, Space, Typography } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import LoadSheet from 'components/LoadSheet';
import SegmentViewer from 'components/SegmentViewer';
import { useFrontAudioService } from 'hooks/useFrontAudioService';

const margin = 20;
const key = 'osmd-main-key';
const Main = styled.div`
  padding: ${margin}px 50px ${margin}px 50px;
`;

export default function OSMDRoute() {
  const {
    frontAudioService: audioService,
    getOrCreateFrontAudioServiceWithGesture: preloadWithGesture,
  } = useFrontAudioService();
  const isLoaded = useMemo(() => audioService !== null, [audioService]);

  return (
    <Main>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Typography.Text>OSMD Component Test Page</Typography.Text>
        <LoadSheet key={key}></LoadSheet>
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
        <SegmentViewer key={key}></SegmentViewer>
      </Space>
    </Main>
  );
}

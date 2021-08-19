import { Button, Space, Typography } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import LoadSheet from 'components/LoadSheet';
import SegmentViewer from 'components/SegmentViewer';
import { useAudioContext } from 'hooks/useAudioContext';

const margin = 20;
const sheetKey = 'osmd-main-key';
const Main = styled.div`
  padding: ${margin}px 50px ${margin}px 50px;
`;

export default function OSMDRoute() {
  const { audioContext, getOrCreateAudioContextWithGesture } =
    useAudioContext();
  const isLoaded = useMemo(() => audioContext !== null, [audioContext]);

  return (
    <Main>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Typography.Text>OSMD Component Test Page</Typography.Text>
        <LoadSheet sheetKey={sheetKey}></LoadSheet>
        {isLoaded ? (
          <Space direction="horizontal" size={8}>
            <CheckCircleOutlined></CheckCircleOutlined>
            <Typography.Text>Audio Context is ready.</Typography.Text>
          </Space>
        ) : (
          <Space direction="horizontal" size={8}>
            <ExclamationCircleOutlined></ExclamationCircleOutlined>
            <Typography.Text>Audio Service is not loaded.</Typography.Text>
          </Space>
        )}
        <Button
          onClick={() => {
            getOrCreateAudioContextWithGesture();
          }}
        >
          Preload Audio Context
        </Button>
        <SegmentViewer sheetKey={sheetKey}></SegmentViewer>
      </Space>
    </Main>
  );
}

import { Button, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { Articulation } from 'services/IAudioService';
import styled from 'styled-components';

import * as Soundfont from 'soundfont-player';
import { AudioContext } from 'standardized-audio-context';
import { usePiano } from 'hooks/usePiano';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const margin = 20;

const Main = styled.div`
  padding: ${margin}px 50px ${margin}px 50px;
`;

export default function OSMDRoute() {
  const { preloadWithGesture, isLoaded, play } = usePiano();

  return (
    <Main>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Typography.Text>OSMD Component Test Page</Typography.Text>
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
          onClick={() => {
            play({
              articulation: Articulation.Legato,
              duration: 1,
              gain: 3,
              midiKeyNumber: 50,
            });
          }}
        >
          play sound
        </Button>
      </Space>
    </Main>
  );
}

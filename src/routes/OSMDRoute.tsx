import { Button, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { Articulation } from 'services/IAudioService';
import styled from 'styled-components';

import * as Soundfont from 'soundfont-player';
import { AudioContext } from 'standardized-audio-context';
import { usePiano } from 'hooks/usePiano';

const margin = 20;

const Main = styled.div`
  padding: ${margin}px 50px ${margin}px 50px;
`;

export default function OSMDRoute() {
  const play = usePiano();

  return (
    <Main>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Typography.Text>OSMD Component Test Page</Typography.Text>
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

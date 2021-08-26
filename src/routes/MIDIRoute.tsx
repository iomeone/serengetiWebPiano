import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Alert, Button, Space, Spin, Typography } from 'antd';
import { useFrontMIDIAudio } from 'hooks/useFrontMIDIAudio';
import { State } from 'modules/State';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setPianoVisibility } from 'modules/piano';
import Piano from 'components/Piano';
import { noteToMidiKeyNumber } from 'utils/Note';
import { useBinaryPressedKeys } from 'hooks/useBinaryPressedKeys';
import { Size } from 'constants/layout';

const hMargin = Size.hMargin;
const margin = Size.margin;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${margin}px ${hMargin}px ${margin}px ${hMargin}px;
`;

export default function MIDIRoute() {
  const piano = useSelector((state: State) => state.piano);
  const dispatch = useDispatch();
  const audioContext = useSelector((state: State) => state.audio.audioContext);
  const isLoaded = useMemo(() => audioContext !== null, [audioContext]);
  const { onKeyUp, onKeyDown, pressedKeys } = useBinaryPressedKeys();
  const { initWithGesture, isMIDIConnected, isMIDISupported } =
    useFrontMIDIAudio(
      (note: number) => {
        onKeyDown(note);
      },
      (note: number) => {
        onKeyUp(note);
      },
    );

  return (
    <Main>
      <Space direction="vertical" size={8}>
        <Typography.Text
          style={{
            fontWeight: 'bold',
          }}
        >
          MIDI
        </Typography.Text>
        {(() => {
          switch (isMIDISupported) {
            case true:
              return (
                <Alert
                  type="success"
                  message="이 브라우저는 MIDI 입력을 지원합니다."
                ></Alert>
              );
            case false:
              return (
                <Alert
                  type="error"
                  message="이 브라우저는 MIDI 입력을 지원하지 않습니다."
                ></Alert>
              );
            case null:
              return <Spin></Spin>;
          }
        })()}
        {isMIDIConnected ? (
          <Space direction="horizontal" size={8}>
            <CheckCircleOutlined></CheckCircleOutlined>
            <Typography.Text>MIDI Device is ready.</Typography.Text>
          </Space>
        ) : (
          <Space direction="horizontal" size={8}>
            <ExclamationCircleOutlined></ExclamationCircleOutlined>
            <Typography.Text>MIDI Device is not connected.</Typography.Text>
          </Space>
        )}
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
            initWithGesture();
          }}
        >
          Activate MIDI Piano
        </Button>
        <Button
          onClick={() => {
            dispatch(setPianoVisibility(true));
          }}
        >
          피아노 열기
        </Button>
        <Piano
          lower={noteToMidiKeyNumber(piano.min)}
          upper={noteToMidiKeyNumber(piano.max)}
          pressedKeys={pressedKeys}
        />
      </Space>
    </Main>
  );
}

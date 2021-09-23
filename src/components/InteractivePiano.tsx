import Piano from './Piano';
import { noteToMidiKeyNumber } from 'utils/Note';
import { useIntergratedPressedKeys } from 'hooks/useIntegratedPressedKeys';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'modules/State';
import styled, { css, keyframes } from 'styled-components';
import {
  CheckOutlined,
  CloseOutlined,
  DownCircleFilled,
  ScissorOutlined,
} from '@ant-design/icons';
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import { setPianoVisibility } from 'modules/piano';
import { Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

const pianoPopUpAnimation = keyframes`
  0%{ opacity: 0; bottom: -6vh;}
  100%{ opacity: 1; bottom: 0px;}
`;

const pianoHideAnimation = keyframes`
  0%{ opacity: 1; bottom: 0px;}
  100%{ opacity: 0; bottom: -6vh;}
`;

type WrapProps = {
  isInit: boolean;
  visibility: boolean;
};

const Wrap = styled.div<WrapProps>`
  position: fixed;
  left: 0px;
  bottom: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  ${({ visibility, isInit }) =>
    css`
      animation-name: ${visibility ? pianoPopUpAnimation : pianoHideAnimation};
      animation-duration: ${isInit ? 0 : 1}s;
      animation-fill-mode: forwards;
    `}
`;

const ReadyButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 210px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid white;
`;

const Blind = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: #000000aa;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-left: 30px;
  margin-right: 30px;
  margin-bottom: 10px;
  position: relative;
`;

const PianoCont = styled.div`
  position: relative;
  width: 100vw;
  height: 18vh;
`;

const DownArrow: React.FunctionComponent<AntdIconProps> = styled(
  DownCircleFilled,
)`
  cursor: pointer;
  color: #fe656a;
  font-size: 30px;
`;

export default function InteractivePiano() {
  const piano = useSelector((state: State) => state.piano);
  const {
    pressedKeys,
    initWithGesture,
    isReady,
    isMIDIConnected,
    isMIDISupported,
  } = useIntergratedPressedKeys();

  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(setPianoVisibility(false));
  };
  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    if (piano.visibility) {
      setIsInit(false);
    }
  }, [piano.visibility]);

  const midiControlPanel = () => {
    if (!isMIDISupported) {
      return <Typography.Text>MIDI not supported</Typography.Text>;
    }
    if (isMIDIConnected) {
      return (
        <Space direction="horizontal" size={4}>
          <CheckOutlined></CheckOutlined>
          <Typography.Text style={{ fontWeight: 'bold' }}>
            MIDI Connected
          </Typography.Text>
        </Space>
      );
    } else {
      return (
        <Space direction="horizontal" size={4}>
          <CloseOutlined></CloseOutlined>
          <Typography.Text style={{ fontWeight: 'bold' }}>
            MIDI Disconnected
          </Typography.Text>
        </Space>
      );
    }
  };

  return (
    <Wrap isInit={isInit} visibility={piano.visibility}>
      <ControlPanel>
        <DownArrow onTouchEnd={onClose} onMouseUp={onClose} />
        <span
          style={{
            position: 'absolute',
            right: 0,
          }}
        >
          {midiControlPanel()}
        </span>
      </ControlPanel>
      <PianoCont>
        <Piano
          pressedKeys={pressedKeys}
          lower={noteToMidiKeyNumber(piano.min)}
          upper={noteToMidiKeyNumber(piano.max)}
        />
        {!isReady && (
          <Blind
            onClick={() => {
              initWithGesture();
            }}
          >
            <ReadyButton>
              <Typography.Text
                style={{
                  color: 'white',
                  fontSize: 21,
                  fontWeight: 'bold',
                }}
              >
                피아노 준비
              </Typography.Text>
            </ReadyButton>
          </Blind>
        )}
      </PianoCont>
    </Wrap>
  );
}

import { Space, Spin } from 'antd';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import {
  loadSheetWithUrlThunk,
  stopOtherPlaybackServicesThunk,
} from 'modules/audio';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Viewer from './Viewer';
import { IoStop, IoPlay, IoPause } from 'react-icons/io5';
import { PlaybackState } from 'osmdAudioPlayer/PlaybackEngine';
import { useSheet } from 'hooks/useSheet';
import { GiMetronome } from 'react-icons/gi';
import { CgPiano } from 'react-icons/cg';
import { setPianoVisibility } from 'modules/piano';
import { State } from 'modules/State';
import { relative } from 'path';
import { NotoSansText } from './NotoSansText';
import { AlignLeftOutlined } from '@ant-design/icons';
enum Control {
  PLAY,
  PAUSE,
  STOP,
  METRONOME,
  PIANO,
  PIANOROLL,
}

type LoadingProps = {
  isLoading: boolean;
};

const Loading = styled.div<LoadingProps>`
  display: ${(props) => (props.isLoading ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

const TitleBar = styled.div`
  display: flex;
  background: linear-gradient(90deg, #dbdef1 0%, #f9f9f9 100%) 0% 0% no-repeat
    padding-box;
  height: 56px;
  justify-content: space-between;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 8px;
`;

const ControlButton = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 20px;
  border: 0.4px solid #707070;
  background: #2f2e410d;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  :hover {
    background: #2f2e4122;
  }
`;

type SegmentViewerProps = {
  sheetKey: string;
  enablePianoRoll?: boolean;
  setSheetKeyOfPianoRoll?: (key:string)=>void;
  setPianoRollModal?: (visible: boolean)=> void;
  title?: string;
  url?: string;
  oneStaff?: boolean;
};
export default function SegmentViewer({
  sheetKey,
  enablePianoRoll,
  setSheetKeyOfPianoRoll,
  setPianoRollModal,
  title,
  url,
  oneStaff,
}: SegmentViewerProps) {
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);

  const { sheet, isLoaded } = useSheet(sheetKey);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (url !== undefined && title !== undefined) {
      setIsSheetLoading(true);
      dispatch(loadSheetWithUrlThunk(sheetKey, title, url));
    }
  }, [url, title, dispatch, sheetKey]);

  useEffect(() => {
    if (isLoaded) {
      setIsSheetLoading(false);
    }
  }, [isLoaded]);

  const piano = useSelector((state: State) => state.piano);
  const pianoVisibility = piano.visibility;

  const height = oneStaff ? 110 : 220;
  const viewerTitle = title ?? 'OSMD Viewer';

  const play = async () => {
    dispatch(stopOtherPlaybackServicesThunk(sheetKey));
    const service = await getOrCreateFrontPlaybackServiceWithGesture();
    service?.play();
  };

  const pause = async () => {
    const service = await getOrCreateFrontPlaybackServiceWithGesture();
    service?.pause();
  };

  const stop = async () => {
    const service = await getOrCreateFrontPlaybackServiceWithGesture();
    service?.stop();
  };

  const toggleMetronome = async () => {
    const met = sheet?.metronomeState ?? false;
    const service = await getOrCreateFrontPlaybackServiceWithGesture();

    if (met) {
      service?.stopMetronome();
    } else {
      dispatch(stopOtherPlaybackServicesThunk(sheetKey));
      service?.startMetronome();
    }
  };

  const setPiano = async (visibility: boolean) => {
    dispatch(setPianoVisibility(visibility));
  };

  const controlPanel = () => {
    let toShow: Control[] = [];
    if (isLoaded) {
      switch (sheet?.playbackState) {
        case null:
          toShow = [Control.PLAY, Control.METRONOME, Control.PIANO,Control.PIANOROLL];
          break;
        case PlaybackState.INIT:
        case PlaybackState.PAUSED:
        case PlaybackState.STOPPED:
          toShow = [
            Control.PLAY,
            Control.STOP,
            Control.METRONOME,
            Control.PIANO,
            Control.PIANOROLL,
          ];
          break;
        case PlaybackState.PLAYING:
          toShow = [
            Control.PAUSE,
            Control.STOP,
            Control.METRONOME,
            Control.PIANO,
          ];
          break;
      }

      return (
        <Space direction="horizontal" size={8}>
          {toShow.map((type) => makeButton(type))}
        </Space>
      );
    }
  };

  const makeButton = (type: Control) => {
    switch (type) {
      case Control.PLAY:
        return (
          <ControlButton onClick={play}>
            <IoPlay />
          </ControlButton>
        );
      case Control.PAUSE:
        return (
          <ControlButton onClick={pause}>
            <IoPause />
          </ControlButton>
        );
      case Control.STOP:
        return (
          <ControlButton onClick={stop}>
            <IoStop />
          </ControlButton>
        );
      case Control.METRONOME:
        return (
          <ControlButton
            onClick={toggleMetronome}
            style={{
              color: sheet?.metronomeState ?? false ? 'black' : '#888888',
            }}
          >
            <GiMetronome></GiMetronome>
          </ControlButton>
        );
      case Control.PIANO:
        return (
          <ControlButton
            onClick={() => {
              setPiano(!pianoVisibility);
            }}
            style={{
              color: pianoVisibility ? 'black' : '#888888',
            }}
          >
            <CgPiano></CgPiano>
          </ControlButton>
        );
      case Control.PIANOROLL:
        return (
          enablePianoRoll && <ControlButton
          onClick={() => {
            if(setPianoRollModal !== undefined && setSheetKeyOfPianoRoll !== undefined){
              setPianoRollModal(true);
              setSheetKeyOfPianoRoll(sheetKey);
            }
          }}
        >
          <AlignLeftOutlined />
        </ControlButton>
        )
    }
  };

  return (
    <Space
      direction="vertical"
      size={10}
      style={{
        width: '100%',
        position: 'relative',
        marginBottom: -60,
        minHeight: height,
      }}
    >
      <TitleBar>
        <NotoSansText>{viewerTitle}</NotoSansText>
        {controlPanel()}
      </TitleBar>
      <Viewer sheetKey={sheetKey}></Viewer>
      <Loading isLoading={isSheetLoading}>
        <Spin size="large"></Spin>
      </Loading>
    </Space>
  );
}

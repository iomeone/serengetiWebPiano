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
import { PlaybackState } from 'osmdAudioPlayer/PlaybackEngine';
import { useSheet } from 'hooks/useSheet';
import { GiMetronome } from 'react-icons/gi';
import { setPianoVisibility } from 'modules/piano';
import { State } from 'modules/State';
import { NotoSansText } from './NotoSansText';
import { useIntergratedPressedKeys } from 'hooks/useIntegratedPressedKeys';
import { CgPiano } from 'react-icons/cg';

enum Control {
  METRONOME,
  MIDIREADY,
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
  background: linear-gradient(90deg, #dbf1e5 0%, #f9f9f9 100%) 0% 0% no-repeat
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

type AlignmentViewerProps = {
  sheetKey: string;
  title?: string;
  url?: string;
};
export default function AlignmentViewer({
  sheetKey,
  title,
  url,
}: AlignmentViewerProps) {
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);

  const { pressedKeys, initWithGesture, isReady } = useIntergratedPressedKeys();

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

  const viewerTitle = title ?? 'Alignment Viewer';

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

  const controlPanel = () => {
    let toShow: Control[] = [];
    if (!isLoaded) toShow = [];
    else {
      toShow = [Control.METRONOME, Control.MIDIREADY];
    }

    return (
      <Space direction="horizontal" size={8}>
        {toShow.map((type) => makeButton(type))}
      </Space>
    );
  };

  const makeButton = (type: Control) => {
    switch (type) {
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
      case Control.MIDIREADY:
        return (
          <ControlButton
            onClick={initWithGesture}
            style={{
              color: isReady ? 'black' : '#888888',
            }}
          >
            <CgPiano></CgPiano>
          </ControlButton>
        );
    }
  };

  return (
    <Space
      direction="vertical"
      size={10}
      style={{
        width: '100%',
        marginBottom: -60,
      }}
    >
      <TitleBar>
        <NotoSansText>{viewerTitle}</NotoSansText>
        {controlPanel()}
      </TitleBar>
      <SheetCont>
        <Viewer sheetKey={sheetKey}></Viewer>
        <Loading isLoading={isSheetLoading}>
          <Spin size="large"></Spin>
        </Loading>
      </SheetCont>
    </Space>
  );
}

const SheetCont = styled.div`
  position: relative;
`;

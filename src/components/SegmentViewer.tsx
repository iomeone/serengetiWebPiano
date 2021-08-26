import { Button, Space, Spin, Typography } from 'antd';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import { loadSheetWithUrlThunk } from 'modules/audio';
import { State } from 'modules/State';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlaybackState } from 'services/IPlaybackService';
import styled from 'styled-components';
import { isLoadedSheet } from 'utils/Sheet';
import Viewer from './Viewer';
import { IoStop, IoPlay, IoPause } from 'react-icons/io5';

const SheetCont = styled.div`
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: white;
  padding-top: 10px;
  position: relative;
`;

type InnerProps = {
  height: number;
};

const Inner = styled.div<InnerProps>`
  width: 100000px;
  height: ${(props) => props.height}px;
`;

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

type SegmentViewerProps = {
  sheetKey: string;
  title?: string;
  url?: string;
  oneStaff?: boolean;
};
export default function SegmentViewer({
  sheetKey,
  title,
  url,
  oneStaff,
}: SegmentViewerProps) {
  const audio = useSelector((state: State) => state.audio);
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);

  const sheet = audio.sheets[sheetKey] ?? null;
  const isLoaded = isLoadedSheet(sheet);

  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!isLoaded && url !== undefined && title !== undefined) {
      setIsSheetLoading(true);
      dispatch(loadSheetWithUrlThunk(sheetKey, title, url));
    }
  }, [url, title, isLoaded, dispatch, sheetKey]);

  useEffect(() => {
    if (isLoadedSheet(sheet)) {
      setIsSheetLoading(false);
    }
  }, [sheet]);

  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    PlaybackState.INIT,
  );

  const height = oneStaff ? 110 : 220;
  const viewerTitle = title ?? 'OSMD Viewer';

  const play = async () => {
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
          {viewerTitle}
        </Typography.Text>
        <Space direction="horizontal" size={8}>
          <Button onClick={play} type="text" shape="circle">
            <IoPlay />
          </Button>
          <Button onClick={pause} type="text" shape="circle">
            <IoPause />
          </Button>
          <Button onClick={stop} type="text" shape="circle">
            <IoStop />
          </Button>
        </Space>
      </div>
      <SheetCont>
        <Inner height={height}>
          <Viewer sheetKey={sheetKey}></Viewer>
        </Inner>
        <Loading isLoading={isSheetLoading}>
          <Spin size="large"></Spin>
        </Loading>
      </SheetCont>
    </div>
  );
}

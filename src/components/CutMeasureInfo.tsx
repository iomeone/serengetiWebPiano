import {
  loadSheetWithUrlThunk,
  stopOtherPlaybackServicesThunk,
} from 'modules/audio';
import { Button, Input, Space, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { MeasureRange } from 'utils/Editor';
import TextEditor from './TextEditor';
import { PlaybackState } from 'osmdAudioPlayer/PlaybackEngine';
import { IoStop, IoPlay, IoPause } from 'react-icons/io5'
import { useSheet } from 'hooks/useSheet';
import { useDispatch } from 'react-redux';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import { ScissorOutlined } from '@ant-design/icons';

type Props = {
  range: MeasureRange | null;
  sheetKey: string;
};

export default function CutMeasureInfo({ range, sheetKey }: Props) {
  const dispatch = useDispatch();
  const { sheet, isLoaded } = useSheet(sheetKey);
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);
  const [title, setTitle] = useState('');
  
  const play = async () => {
    dispatch(stopOtherPlaybackServicesThunk(sheetKey));
    const service = await getOrCreateFrontPlaybackServiceWithGesture();
    service?.play();
    if(range != null)
    service?.jumpToMeasure(range.start);
    // useEffect range.end
    // service?.addPlaybackStateListener
  };

  const pause = async () => {
    const service = await getOrCreateFrontPlaybackServiceWithGesture();
    service?.pause();
  };

  const stop = async () => {
    const service = await getOrCreateFrontPlaybackServiceWithGesture();
    service?.stop();
  };

  // TODO : Show SegmentViewer;
  return (
    <Space
      direction="vertical"
      size={10}
      style={{
        marginTop: 20,
        width: '100%',
        marginBottom: 20,
      }}
    >
      <TextEditor tag="제목" title={title} onSubmit={setTitle}></TextEditor>
      <Space direction="horizontal" size={6}>
        <Typography.Text
          style={{
            fontWeight: 'bold',
          }}
        >
          마디 |
        </Typography.Text>
        {range !== null && (
            <>
              {range.start + 1} ~ {range.end + 1} 마디
              <Button
                onClick={()=>{
                  //cut function
              }}>
                <ScissorOutlined />자르기
              </Button>
            </>
        )}
      </Space>
    </Space>
  );
}

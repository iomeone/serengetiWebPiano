import { Space, Spin, Typography } from 'antd';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import {
  loadSheetWithUrlThunk,
  stopOtherPlaybackServicesThunk,
} from 'modules/audio';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import Viewer, { ResizeState } from './Viewer';
import { useSheet } from 'hooks/useSheet';
import { GiMetronome } from 'react-icons/gi';
import { NotoSansText } from './NotoSansText';
import { useIntergratedPressedKeys } from 'hooks/useIntegratedPressedKeys';
import { CgPiano } from 'react-icons/cg';
import {
  getStaffLines,
  StaffLine,
  getMeasureBoundingBoxes,
  Rect,
  getNoteSchedules,
  NoteSchedule,
  getBPM,
  getDenominator,
} from 'utils/OSMD';
import { AlignmentService, Similarity } from 'services/AlignmentService';
import { useAnimationFrame } from 'hooks/useAnimationFrame';

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

type UseAlignmentRes = {
  initWithGesture: () => void;
  isReady: boolean;
  alignmentService: AlignmentService | null;
};
const useAlignment = (): UseAlignmentRes => {
  const { initWithGesture, isReady, pressedBinaryKeys } =
    useIntergratedPressedKeys();

  const [alignmentService, setAlignmentService] =
    useState<AlignmentService | null>(null);

  const startMIDI = () => {
    initWithGesture();
    const service = new AlignmentService();
    setAlignmentService(service);
  };

  useEffect(() => {
    if (alignmentService !== null) {
      alignmentService.setBinaryPressedKeys(pressedBinaryKeys);
    }
  }, [pressedBinaryKeys, alignmentService]);

  useEffect(() => {
    return () => {
      if (alignmentService !== null) {
        alignmentService.destroy();
      }
    };
    //eslint-disable-next-line
  }, []);

  return { initWithGesture: startMIDI, isReady, alignmentService };
};

export default function AlignmentViewer({
  sheetKey,
  title,
  url,
}: AlignmentViewerProps) {
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);
  const { isReady, initWithGesture, alignmentService } = useAlignment();
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

  /* Sheet Info */

  const sheetRef = useRef<HTMLDivElement>(null);
  const [staffLines, setStaffLine] = useState<StaffLine[] | null>(null);
  const [measureBoxes, setMeasureBoxes] = useState<Rect[] | null>(null);
  const [noteSchedules, setNoteSchedules] = useState<NoteSchedule[] | null>(
    null,
  );
  const [resize, setResize] = useState<ResizeState>(ResizeState.Init);
  useEffect(() => {
    if (isLoaded && resize === ResizeState.ResizeEnd) {
      setMeasureBoxes(getMeasureBoundingBoxes(sheet?.osmd));
      setStaffLine(getStaffLines(sheet?.osmd));
      setNoteSchedules(getNoteSchedules(sheet?.osmd));
    }
  }, [sheet, isLoaded, resize]);
  const [lastMeasureInd, setLastMeasureInd] = useState<number | null>(null);
  const refreshLastMeasureInd = () => {
    const rect = sheetRef.current?.getBoundingClientRect();
    const y = rect?.y;
    if (y !== undefined) {
      let measureInd = -1;
      if (staffLines !== null) {
        for (const line of staffLines) {
          if (line.bottom + y > window.innerHeight) {
            break;
          } else {
            measureInd = line.lastMeasureInd;
          }
        }
      }
      setLastMeasureInd(measureInd);
    }
  };
  useEffect(() => {
    if (staffLines !== null) {
      refreshLastMeasureInd();
    }
    //eslint-disable-next-line
  }, [staffLines]);
  useEffect(() => {
    if (alignmentService === null || noteSchedules === null) return;
    alignmentService.setBPM(getBPM(sheet?.osmd));
    alignmentService.setDenominator(getDenominator(sheet?.osmd));
    alignmentService.setNoteScheduleSequence(noteSchedules);
    if (lastMeasureInd) alignmentService.setLastMeasureInd(lastMeasureInd);
    alignmentService.init();
    //eslint-disable-next-line
  }, [alignmentService, noteSchedules]);
  useEffect(() => {
    if (alignmentService === null || lastMeasureInd === null) return;
    alignmentService.setLastMeasureInd(lastMeasureInd);
    //eslint-disable-next-line
  }, [lastMeasureInd]);

  onscroll = () => {
    refreshLastMeasureInd();
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
      {alignmentService !== null && (
        <SimilarityMonitor service={alignmentService}></SimilarityMonitor>
      )}
      <TitleBar>
        <NotoSansText>{viewerTitle}</NotoSansText>
        {controlPanel()}
      </TitleBar>
      <SheetCont ref={sheetRef}>
        <Viewer sheetKey={sheetKey} onResize={setResize}></Viewer>
        {measureBoxes !== null &&
          measureBoxes.map((box, ind) => (
            <Box
              key={ind}
              selected={ind === lastMeasureInd}
              style={{
                left: box.left,
                top: box.top,
                width: box.right - box.left,
                height: box.bottom - box.top,
              }}
            ></Box>
          ))}
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

type BoxProps = {
  selected: boolean;
};

const Box = styled.div<BoxProps>`
  position: absolute;
  background-color: ${(props) =>
    props.selected ? '#91eebb44' : 'transparent'};
`;

/* similarity-monitor */

const MATRIX_HEIGHT = 128;

type SimilarityMonitorProps = {
  service: AlignmentService;
};

const Cont = styled.div`
  position: fixed;
  right: 0;
  top: 0;
`;
const NumberCont = styled.div`
  background-color: #333333aa;
  font-size: 16px;
  padding: 4px;
`;

function SimilarityMonitor({ service }: SimilarityMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevTime = useRef(0);
  const fps = 20;
  const frameStep = 1000 / fps;
  const gap = 8;

  const [similarity, setSimilarity] = useState<Similarity | null>(null);
  useEffect(() => {
    service.addSimilarityChangeListener(setSimilarity);
  }, [service]);

  useAnimationFrame((time) => {
    if (time - prevTime.current < frameStep) {
      return;
    }
    prevTime.current = time;

    if (canvasRef?.current?.getContext) {
      var ctx = canvasRef.current.getContext('2d');
      if (ctx === null) return;

      const userBinaryMidiKeyMatrix = service.getUserBinaryMIDIKeyMatrix();
      const scoreBinaryMidiKeyMatrix = service.getScoreBinaryMIDIKeyMatrix();

      for (let rowInd = 0; rowInd < service.sampleLength; rowInd++) {
        for (let i = 0; i < MATRIX_HEIGHT; i++) {
          if (userBinaryMidiKeyMatrix[rowInd * MATRIX_HEIGHT + i] === 1) {
            ctx.fillStyle = '#1e88ffaa';
          } else {
            ctx.fillStyle = '#33333355';
          }
          ctx.fillRect(rowInd, MATRIX_HEIGHT - i, 1, 1);
        }
      }

      if (scoreBinaryMidiKeyMatrix !== null) {
        const offset = service.sampleLength + gap;
        for (
          let rowInd = 0;
          rowInd < (service.MeasureSamples as number);
          rowInd++
        ) {
          for (let i = 0; i < MATRIX_HEIGHT; i++) {
            if (scoreBinaryMidiKeyMatrix[rowInd * MATRIX_HEIGHT + i] === 1) {
              ctx.fillStyle = '#1eff56aa';
            } else {
              ctx.fillStyle = '#33333355';
            }
            ctx.fillRect(rowInd + offset, MATRIX_HEIGHT - i, 1, 1);
          }
        }
      }
    }
  }, []);

  return (
    <Cont>
      <canvas
        width={service.sampleLength + gap + service.MeasureSamples}
        height={MATRIX_HEIGHT}
        ref={canvasRef}
      ></canvas>
      <NumberCont>
        <Typography.Text
          style={{
            color: 'white',
          }}
        >
          ED: {(similarity?.euclideanError ?? -1).toFixed(3)}
        </Typography.Text>
      </NumberCont>
      <NumberCont>
        <Typography.Text
          style={{
            color: 'white',
          }}
        >
          LV: {(similarity?.levenshteinError ?? -1).toFixed(3)}
        </Typography.Text>
      </NumberCont>
    </Cont>
  );
}

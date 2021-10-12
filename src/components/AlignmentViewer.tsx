import { Space, Spin } from 'antd';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import {
  loadSheetWithUrlThunk,
  stopOtherPlaybackServicesThunk,
} from 'modules/audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled, { css } from 'styled-components';
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
  getNumerator,
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

enum MeasureState {
  DEFAULT,
  UNPLAYED,
  PLAYED,
  PREVIOUS_STAFF,
}

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

  /* sheet-info */

  const sheetRef = useRef<HTMLDivElement>(null);
  const [staffLines, setStaffLines] = useState<StaffLine[] | null>(null);
  const [measureBoxes, setMeasureBoxes] = useState<Rect[] | null>(null);
  const [noteSchedules, setNoteSchedules] = useState<NoteSchedule[] | null>(
    null,
  );
  const [lastStaffInd, setLastStaffInd] = useState<number | null>(null);
  const [resize, setResize] = useState<ResizeState>(ResizeState.Init);

  useEffect(() => {
    if (isLoaded && resize === ResizeState.ResizeEnd) {
      setMeasureBoxes(getMeasureBoundingBoxes(sheet?.osmd));
      setStaffLines(getStaffLines(sheet?.osmd));
      setNoteSchedules(getNoteSchedules(sheet?.osmd));
    }
  }, [sheet, isLoaded, resize]);

  const refreshLastStaffInd = () => {
    const rect = sheetRef.current?.getBoundingClientRect();
    const y = rect?.y;
    if (y !== undefined) {
      let staffInd = -1;
      if (staffLines !== null) {
        for (let ind = 0; ind < staffLines.length; ind++) {
          if (staffLines[ind].bottom + y > window.innerHeight) {
            break;
          } else {
            staffInd = ind;
          }
        }
        setLastStaffInd(staffInd);
      }
    }
  };

  useEffect(() => {
    if (staffLines !== null) {
      refreshLastStaffInd();
    }
    //eslint-disable-next-line
  }, [staffLines]);

  useEffect(() => {
    if (
      alignmentService === null ||
      noteSchedules === null ||
      staffLines === null
    )
      return;
    alignmentService.setBPM(getBPM(sheet?.osmd));
    alignmentService.setDenominator(getDenominator(sheet?.osmd));
    alignmentService.setNumerator(getNumerator(sheet?.osmd));
    alignmentService.setNoteScheduleSequence(noteSchedules);
    alignmentService.setStaffLines(staffLines);
    if (lastStaffInd) alignmentService.setLastStaffInd(lastStaffInd);
    alignmentService.init();

    //eslint-disable-next-line
  }, [alignmentService, noteSchedules]);

  const [skipPreviousStaffFlush, setSkipPreviousStaffFlush] = useState(false);

  useEffect(() => {
    if (
      alignmentService === null ||
      lastStaffInd === null ||
      staffLines === null
    )
      return;
    alignmentService.setStaffLines(staffLines);
    alignmentService.setLastStaffInd(lastStaffInd);

    if (!skipPreviousStaffFlush) {
      setPreviousStaffInd(null);
    }

    //eslint-disable-next-line
  }, [lastStaffInd]);

  onscroll = () => {
    refreshLastStaffInd();
  };

  const [previousStaffInd, setPreviousStaffInd] = useState<number | null>(null);
  const [checkArray, setCheckArray] = useState<boolean[] | null>(null);
  const [similarityArray, setSimilarityArray] = useState<Similarity[] | null>(
    null,
  );
  useEffect(() => {
    if (alignmentService !== null) {
      alignmentService.addSimilarityArrayChangeListener(setSimilarityArray);
      alignmentService.addScoreChangeListener(() => {
        refreshCheckArray(alignmentService);
      });
    }
  }, [alignmentService]);
  const refreshCheckArray = (service: AlignmentService) => {
    const length = service.getNumMeasures();
    setCheckArray(Array.from({ length }, () => false));
  };
  const check = (similarity: Similarity) => {
    const ee = similarity.euclideanError;
    const le = similarity.levenshteinError;

    return ee > 0 && le > 0 && ee + le < 0.87;
  };
  useEffect(() => {
    if (
      similarityArray === null ||
      checkArray === null ||
      similarityArray.length !== checkArray.length
    ) {
      return;
    }

    const newCheckArray = [];
    for (let i = 0; i < similarityArray.length; i++) {
      const similarity = similarityArray[i];
      newCheckArray.push(check(similarity) || checkArray[i]);
    }
    setCheckArray(newCheckArray);
    //eslint-disable-next-line
  }, [similarityArray]);

  const SCROLL_MARGIN = 40;

  useEffect(() => {
    if (checkArray === null || staffLines === null || lastStaffInd === null)
      return;

    const pageTurn =
      checkArray.filter((check) => check).length >=
      Math.ceil(checkArray.length / 2);

    if (pageTurn) {
      const lastStaff = staffLines[lastStaffInd];

      setSkipPreviousStaffFlush(true);
      setPreviousStaffInd(lastStaffInd);

      const rect = sheetRef.current?.getBoundingClientRect();
      const y = rect?.y;
      if (y !== undefined) {
        const upWard = y + lastStaff.top - SCROLL_MARGIN;
        window.scrollBy({
          top: upWard,
          left: 0,
          behavior: 'smooth',
        });
      }

      setTimeout(() => {
        setSkipPreviousStaffFlush(false);
      }, 1000);
    }
  }, [checkArray]);

  const getMeasureState = (measureInd: number): MeasureState => {
    if (staffLines === null || lastStaffInd === null || checkArray === null)
      return MeasureState.DEFAULT;

    if (previousStaffInd !== null) {
      const prevStaff = staffLines[previousStaffInd];

      if (
        prevStaff.firstMeasureInd <= measureInd &&
        measureInd <= prevStaff.lastMeasureInd
      )
        return MeasureState.PREVIOUS_STAFF;
    }

    const curStaff = staffLines[lastStaffInd];
    if (
      curStaff.firstMeasureInd > measureInd ||
      measureInd > curStaff.lastMeasureInd
    )
      return MeasureState.DEFAULT;

    const ind = measureInd - curStaff.firstMeasureInd;
    return checkArray[ind] ? MeasureState.PLAYED : MeasureState.UNPLAYED;
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
              state={getMeasureState(ind)}
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
  state: MeasureState;
};

const Box = styled.div<BoxProps>`
  position: absolute;
  background-color: ${(props) => {
    switch (props.state) {
      case MeasureState.DEFAULT:
        return 'transparent';
      case MeasureState.UNPLAYED:
        return '#ee979144';
      case MeasureState.PLAYED:
        return '#91eebb44';
      case MeasureState.PREVIOUS_STAFF:
        return '#a8d6f544';
    }
  }};
`;

/* similarity-monitor */

const MATRIX_HEIGHT = 128;

type SimilarityMonitorProps = {
  service: AlignmentService;
};

const Cont = styled.div`
  position: fixed;
  z-index: 10;
  right: 0;
  top: 0;
`;

const userInputColor = '#c5177daa';
const scoreColor = '#1a0bebea';
const backgroundColor = 'rgba(41, 41, 41, 0.08)';
const textColor = '#d10bebea';

type NumberContProps = {
  userSamples: number;
  gap: number;
  scoreSamples: number;
};
const NumberCont = styled.div<NumberContProps>`
  background-color: ${backgroundColor};
  padding: 2px;
  font-size: 12px;
  ${({ scoreSamples, userSamples, gap }) => css`
    & > span {
      display: inline-block;
      width: ${scoreSamples}px;
      margin-right: ${gap}px;
      padding-left: 8px;
      color: ${textColor};
    }
    span:first-child {
      width: ${userSamples - 6}px;
      padding-left: 0px;
    }
    span:last-child {
      width: auto;
      margin-right: 0px;
    }
  `}
`;

function SimilarityMonitor({ service }: SimilarityMonitorProps) {
  const canvasUserRef = useRef<HTMLCanvasElement>(null);
  const canvasScoreRef = useRef<HTMLCanvasElement>(null);
  const prevTime = useRef(0);
  const fps = 20;
  const frameStep = 1000 / fps;
  const gap = 8;

  const [similarityArray, setSimilarityArray] = useState<Similarity[] | null>(
    null,
  );
  const scoreMatrixArrayRef = useRef<Uint8Array[] | null>(null);

  const drawUserInput = useCallback(() => {
    if (canvasUserRef?.current?.getContext === undefined) return;
    const canvas = canvasUserRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const userBinaryMidiKeyMatrix = service.getUserBinaryMIDIKeyMatrix();
    for (let rowInd = 0; rowInd < service.sampleLength; rowInd++) {
      for (let i = 0; i < MATRIX_HEIGHT; i++) {
        if (userBinaryMidiKeyMatrix[rowInd * MATRIX_HEIGHT + i] === 1) {
          ctx.fillStyle = userInputColor;
        } else {
          ctx.fillStyle = backgroundColor;
        }
        ctx.fillRect(rowInd, MATRIX_HEIGHT - i, 1, 1);
      }
    }
  }, [canvasUserRef, service]);

  const drawScores = useCallback(() => {
    if (canvasScoreRef?.current?.getContext === undefined) return;
    const canvas = canvasScoreRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;
    const scoreBinaryMidiKeyMatrixArray = scoreMatrixArrayRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (scoreBinaryMidiKeyMatrixArray !== null) {
      let offset = 0;
      for (const scoreMatrix of scoreBinaryMidiKeyMatrixArray) {
        for (
          let rowInd = 0;
          rowInd < (service.MeasureSamples as number);
          rowInd++
        ) {
          for (let i = 0; i < MATRIX_HEIGHT; i++) {
            if (scoreMatrix[rowInd * MATRIX_HEIGHT + i] === 1) {
              ctx.fillStyle = scoreColor;
            } else {
              ctx.fillStyle = backgroundColor;
            }
            ctx.fillRect(rowInd + offset, MATRIX_HEIGHT - i, 1, 1);
          }
        }
        offset += gap + service.MeasureSamples;
      }
    }
  }, [canvasScoreRef, service]);

  const needDrawScoreRef = useRef(false);
  const [needDrawScore, setNeedDrawScore] = useState(false);

  useEffect(() => {
    service.addSimilarityArrayChangeListener(setSimilarityArray);
    service.addScoreChangeListener(() => {
      scoreMatrixArrayRef.current = service.getScoreBinaryMIDIKeyMatrixArray();
      setNeedDrawScore(true);
    });
  }, [service]);

  useAnimationFrame(
    (time) => {
      if (time - prevTime.current < frameStep) {
        return;
      }
      prevTime.current = time;
      drawUserInput();

      if (needDrawScoreRef.current) {
        drawScores();
        setNeedDrawScore(false);
      }
    },
    [drawUserInput, drawScores],
  );

  const numMeasures = service.getNumMeasures();
  const canvasUserWidth = service.sampleLength;
  const canvasScoreWidth =
    gap * (numMeasures - 1) + service.MeasureSamples * numMeasures;

  useEffect(() => {
    needDrawScoreRef.current = needDrawScore;
  }, [needDrawScore]);

  return (
    <Cont>
      <Space size={gap}>
        <canvas
          width={canvasUserWidth}
          height={MATRIX_HEIGHT}
          ref={canvasUserRef}
        ></canvas>
        <canvas
          width={canvasScoreWidth}
          height={MATRIX_HEIGHT}
          ref={canvasScoreRef}
        ></canvas>
      </Space>
      <NumberCont
        gap={gap}
        userSamples={service.sampleLength}
        scoreSamples={service.MeasureSamples}
      >
        <span>Euclidian</span>
        {similarityArray?.map((similarity, ind) => (
          <span key={ind}>{similarity.euclideanError.toFixed(2)}</span>
        ))}
      </NumberCont>
      <NumberCont
        gap={gap}
        userSamples={service.sampleLength}
        scoreSamples={service.MeasureSamples}
      >
        <span>Levenshtein</span>
        {similarityArray?.map((similarity, ind) => (
          <span key={ind}>{similarity.levenshteinError.toFixed(2)}</span>
        ))}
      </NumberCont>
    </Cont>
  );
}

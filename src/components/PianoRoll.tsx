import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NotePlayOption } from 'services/IAudioService';
import { CaretRightOutlined } from '@ant-design/icons';
import Restart from '../assets/restart.svg';
import Start from '../assets/start.svg';
import styled from 'styled-components';
import { FrontAudioService } from 'services/FrontAudioService';
import {
  Fraction,
  NoteType,
  OpenSheetMusicDisplay as OSMD,
} from 'opensheetmusicdisplay';
import { Button } from 'antd';
import { useSelector } from 'react-redux';
import { State } from 'modules/State';
import { IAudioContext } from 'standardized-audio-context';
import PlaybackEngine from 'osmd-audio-player';
import { NoteSchedule } from 'services/OSMDService';
import {
  midiKeyNumberToKeyType,
  noteToDiatonicNumber,
  noteToBetterNoteName,
} from 'utils/Note';

type Props = {
  state: PlayState;
  onFinish?: () => void;
  noteSchedules: NoteSchedule[] | null;
  bpm: number | null;
  timeSigniture: Fraction | null;
};

export enum PlayState {
  PREPARE,
  PLAYING,
  PAUSE,
  FINISH,
}

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Canvas = styled.canvas`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;
// 이거 어디로 ?
const ImgRestart = new Image();
ImgRestart.src = Restart;

const ImgStart = new Image();
ImgStart.src = Start;

const measureLength = 500;
const height = 15;
const leading = 15;

export default function PianoRoll({
  noteSchedules,
  state,
  bpm,
  timeSigniture,
  onFinish,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [myState, setMyState] = useState(PlayState.PREPARE);

  const [startTime, setStartTime] = useState<number>(0);
  const [pauseTime, setPauseTime] = useState<number>(0);

  const velocity = useMemo(() => {
    if (timeSigniture !== null && bpm !== null) {
      return bpm / timeSigniture.Numerator / 60000;
    } else {
      return 0;
    }
  }, [timeSigniture, bpm]);

  const songLength = useMemo(() => {
    if (noteSchedules !== null && timeSigniture !== null && bpm !== null) {
      let lastPoint = 0;
      for (let i = 0; i < noteSchedules.length; i++) {
        const endPoint = noteSchedules[i].timing + noteSchedules[i].length;
        if (endPoint > lastPoint) {
          lastPoint = endPoint;
        }
      }
      return lastPoint / velocity;
    } else {
      return 0;
    }
  }, [noteSchedules, velocity]);

  useEffect(() => {
    //prepare pianoroll
    console.log(noteSchedules);
  }, [noteSchedules]);

  useEffect(() => {
    setMyState(state);
  }, [state]);

  useEffect(() => {
    switch (+myState) {
      case PlayState.PAUSE:
        setPauseTime(Date.now());
        break;
      case PlayState.FINISH:
        if (onFinish !== undefined) {
          onFinish();
        }
        break;
    }
  }, [myState]);

  const drawRoll = (
    context: CanvasRenderingContext2D,
    playTime: number,
    timeSigniture: number,
    noteSchedules: NoteSchedule[],
  ) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = '#000000';

    const bottom = 170;

    drawMeasure(context, 50, bottom);
    drawCursor(context, 50);

    noteSchedules.forEach((schedule) => {
      drawNote(context, playTime, 50, bottom, timeSigniture, schedule);
    });
  };

  const drawMeasure = (
    context: CanvasRenderingContext2D,
    x: number,
    bottomY: number,
  ) => {
    context.strokeStyle = 'black';

    for (let i = 0; i < 5; i++) {
      context.beginPath(); // Start a new path
      context.moveTo(x, bottomY - leading * i); // Move the pen to (30, 50)
      context.lineTo(x + measureLength, bottomY - leading * i); // Draw a line to (150, 100)
      context.stroke();
    }
  };
  const drawCursor = (context: CanvasRenderingContext2D, cursorX: number) => {
    context.strokeStyle = '';
    context.beginPath(); // Start a new path
    context.moveTo(cursorX, 0); // Move the pen to (30, 50)
    context.lineTo(cursorX, context.canvas.height); // Draw a line to (150, 100)
    context.stroke();
  };
  const drawNote = (
    context: CanvasRenderingContext2D,
    playTime: number,
    cursorX: number,
    bottomY: number,
    timeSigniture: number,
    noteSchedule: NoteSchedule,
  ) => {
    // midikey => color,y

    const Barcolor = [
      '#ee2f27',
      '#f07e28',
      '#f9a11b',
      '#f8d308',
      '#f2ef16',
      '#a1ce37',
      '#4bb748',
      '#38afd1',
      '#2d76bb',
      '#38479c',
      '#6d429b',
      '#c52a90',
    ];

    const width = (measureLength * noteSchedule.length) / timeSigniture;
    const height = 15;
    const x =
      cursorX +
      measureLength *
        (noteSchedule.timing / timeSigniture - playTime * velocity);
    const y =
      bottomY +
      30 -
      (leading / 2) * (noteToDiatonicNumber(noteSchedule.note) - 24);

    context.fillStyle = Barcolor[noteSchedule.note.pitchClass];
    context.fillRect(x, y, width, height);

    context.fillStyle = '#000000';
    context.fillText(noteToBetterNoteName(noteSchedule.note), x + 4, y + 11);
  };

  const drawStartScreen = (context: CanvasRenderingContext2D) => {
    context.fillStyle = '#00000050';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    context.drawImage(
      ImgStart,
      context.canvas.width / 2 - 19,
      context.canvas.height / 2 - 25,
      38,
      50,
    );
  };

  const drawRestartScreen = (context: CanvasRenderingContext2D) => {
    context.fillStyle = '#00000050';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    context.drawImage(
      ImgRestart,
      context.canvas.width / 2 - 25,
      context.canvas.height / 2 - 25,
      50,
      50,
    );
    //
  };

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }
    const context = canvasRef.current.getContext('2d');
    if (context) context.globalAlpha = 1.0;
    let animationFrameId: number;

    const render = () => {
      if (context) {
        let playTime = 0;
        switch (+myState) {
          case PlayState.PREPARE:
            playTime = 0;
            break;
          case PlayState.PAUSE:
            playTime = pauseTime - startTime;
            break;
          case PlayState.PLAYING:
            playTime = Date.now() - startTime;
            break;
          case PlayState.FINISH:
            playTime = songLength;
            break;
        }

        if (playTime > songLength) {
          finishRoll();
        }
        if (noteSchedules !== null && timeSigniture !== null)
          drawRoll(context, playTime, timeSigniture.RealValue, noteSchedules);

        animationFrameId = window.requestAnimationFrame(render);

        switch (+myState) {
          case PlayState.PREPARE:
          case PlayState.PAUSE:
            drawStartScreen(context);
            break;
          case PlayState.FINISH:
            drawRestartScreen(context);
            break;
        }
      }
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [drawRoll]);

  const prepareRoll = () => {
    //
  };
  const startRoll = () => {
    setMyState(PlayState.PLAYING);
    setStartTime(Date.now());
  };
  const pauseRoll = () => {
    setMyState(PlayState.PAUSE);
    setPauseTime(Date.now());
  };
  const restartRoll = () => {
    setMyState(PlayState.PLAYING);
    setStartTime(Date.now() - (pauseTime - startTime));
  };
  const finishRoll = () => {
    setMyState(PlayState.FINISH);
  };

  const onClick = () => {
    switch (+myState) {
      case PlayState.PREPARE:
      case PlayState.FINISH:
        startRoll();
        break;
      case PlayState.PLAYING:
        pauseRoll();
        break;
      case PlayState.PAUSE:
        restartRoll();
        break;
    }
  };

  return (
    <Wrap>
      <Canvas width={900} height={300} ref={canvasRef} onClick={onClick} />
    </Wrap>
  );
}

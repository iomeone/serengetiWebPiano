import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Restart from '../assets/restart.svg';
import Start from '../assets/start.svg';
import styled from 'styled-components';
import { Fraction } from 'opensheetmusicdisplay';
import { Alert, Button, Space, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'modules/State';
import { NoteSchedule } from 'utils/OSMD';
import {
  Note,
  noteToBetterNoteName,
  noteToDiatonicNumber,
  noteToMidiKeyNumber,
} from 'utils/Note';
import { setPianoVisibility } from 'modules/piano';
import { useBinaryPressedKeys } from 'hooks/useBinaryPressedKeys';
import { useFrontMIDIAudio } from 'hooks/useFrontMIDIAudio';
import Piano from './Piano';

type Props = {
  state: PlayState;
  onFinish?: () => void;
  noteSchedules: NoteSchedule[] | null;
  bpm: number | null;
  timeSigniture: Fraction | null;
  playMode: PlayMode;
};

export enum PlayMode {
  HOLD,
  NONHOLD,
}

export enum PlayState {
  PREPARE,
  PLAYING,
  HOLD,
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
const leading = 15;

export default function PianoRoll({
  noteSchedules,
  state,
  bpm,
  playMode,
  timeSigniture,
  onFinish,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [myState, setMyState] = useState(PlayState.PREPARE);

  const [startTime, setStartTime] = useState<number>(0);
  const [pauseTime, setPauseTime] = useState<number>(0);
  const [holdTime, setHoldTime] = useState<number>(0);

  const [holdTiming, setHoldTiming] = useState<number>(-1);
  const [holdNote, setHoldNote] = useState<Note[]>([]);

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
  }, [noteSchedules, velocity, timeSigniture, bpm]);

  useEffect(() => {
    //prepare pianoroll
    console.log(noteSchedules);
    nextHold();
  }, [noteSchedules]);

  useEffect(() => {
    if (playMode === PlayMode.HOLD) {
      //console.log(pressedKeys);
      if (pressedKeys.length !== holdNote.length) {
        console.log(false);
      } else {
        holdNote.sort((a, b) => {
          return noteToMidiKeyNumber(a) - noteToMidiKeyNumber(b);
        });

        let check = true;
        for (let i = 0; i < holdNote.length; i++) {
          if (
            noteToMidiKeyNumber(holdNote[i]) !==
            noteToMidiKeyNumber(pressedKeys[i])
          ) {
            check = false;
            break;
          }
        }
        if (check) {
          unholdRoll();
        }
      }
    }
  }, [pressedKeys]);

  useEffect(() => {
    setMyState(state);
  }, [state]);

  useEffect(() => {
    switch (+myState) {
      case PlayState.PAUSE:
        setPauseTime(Date.now());
        break;
      case PlayState.HOLD:
        setHoldTime(() => Date.now());
        break;
      case PlayState.FINISH:
        if (onFinish !== undefined) {
          onFinish();
        }
        break;
    }
  }, [myState, onFinish]);

  const drawRoll = (
    context: CanvasRenderingContext2D,
    playTime: number,
    timeSigniture: number,
    noteSchedules: NoteSchedule[],
  ) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = '#000000';

    const bottom = 170;
    drawMeasure(context, playTime, 50 - 2 * measureLength, bottom);
    drawMeasure(context, playTime, 50 - measureLength, bottom);
    drawMeasure(context, playTime, 50, bottom);
    drawMeasure(context, playTime, 50 + measureLength, bottom);
    drawMeasure(context, playTime, 50 + 2 * measureLength, bottom);

    noteSchedules.forEach((schedule) => {
      drawNote(context, playTime, 50, bottom, timeSigniture, schedule);
    });

    drawCursor(context, 50);
  };

  const drawMeasure = (
    context: CanvasRenderingContext2D,
    x: number,
    bottomY: number,
  ) => {
    context.strokeStyle = 'black';
    context.beginPath();
    context.moveTo(x ,bottomY - 4 * leading);
    context.lineTo(x ,bottomY);
    context.stroke();
    for (let i = 0; i < 5; i++) {
      context.beginPath(); // Start a new path
      context.moveTo(x, bottomY - leading * i); // Move the pen to (30, 50)
      context.lineTo(x + measureLength, bottomY - leading * i); // Draw a line to (150, 100)
      context.stroke();
    }
    context.beginPath();
    context.moveTo(x + measureLength,bottomY - 4 * leading);
    context.lineTo(x + measureLength,bottomY);
    context.stroke();

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
      30 +
      15 / 2 -
      (leading / 2) * (noteToDiatonicNumber(noteSchedule.note) - 24);
    const radius = height/2;
    context.fillStyle = Barcolor[noteSchedule.note.pitchClass];
    context.beginPath();
    context.arc(x+radius,y+radius,radius, Math.PI /2, 3/2 * Math.PI);
    context.arc(x+width-radius,y+radius,radius, Math.PI * 3/2, Math.PI/2);
    context.lineTo(x+radius,y+height);
    context.fill(); 

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
          case PlayState.HOLD:
            playTime = holdTiming / velocity;
            break;
          case PlayState.PLAYING:
            playTime = Date.now() - startTime;
            if (
              playMode === PlayMode.HOLD &&
              playTime >= holdTiming / velocity
            ) {
              playTime = holdTiming / velocity;
            }
            break;
          case PlayState.FINISH:
            playTime = songLength;
            break;
        }

        if (noteSchedules !== null && timeSigniture !== null)
          drawRoll(context, playTime, timeSigniture.RealValue, noteSchedules);

        animationFrameId = window.requestAnimationFrame(render);

        if (playTime > songLength) {
          finishRoll();
        }

        if (
          myState === PlayState.PLAYING &&
          playMode === PlayMode.HOLD &&
          playTime >= holdTiming / velocity
        ) {
          holdRoll();
        }

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
  }, [
    drawRoll,
    myState,
    noteSchedules,
    pauseTime,
    songLength,
    startTime,
    timeSigniture,
  ]);

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
    setStartTime(() => Date.now() - (pauseTime - startTime));
  };
  const holdRoll = () => {
    setMyState(PlayState.HOLD);
    setHoldTime(() => Date.now());
  };
  const unholdRoll = () => {
    nextHold();
    setMyState(PlayState.PLAYING);
    setStartTime(() => Date.now() - (holdTime - startTime));
  };

  const finishRoll = () => {
    setMyState(PlayState.FINISH);
  };

  const nextHold = () => {
    if (noteSchedules !== null) {
      for (let i = 0; i < noteSchedules.length; i++) {
        if (holdTiming < noteSchedules[i].timing) {
          setHoldNote(() => {
            const notes = [];
            for (
              let j = i;
              noteSchedules[i].timing === noteSchedules[j].timing;
              j++
            ) {
              notes.push(noteSchedules[j].note);
            }
            console.log(notes);
            return notes;
          });
          setHoldTiming(() => noteSchedules[i].timing);
          break;
        }
      }
    }
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
    <>
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
      <Wrap>
        <Button
          onClick={() => {
            holdRoll();
          }}
        >
          hold
        </Button>
        <Button
          onClick={() => {
            unholdRoll();
          }}
        >
          unhold
        </Button>
        <Canvas width={900} height={300} ref={canvasRef} onClick={onClick} />
      </Wrap>
    </>
  );
}

import { ArrowLeftOutlined, ConsoleSqlOutlined } from '@ant-design/icons';
import { useIntergratedPressedKeys } from 'hooks/useIntegratedPressedKeys';
import { useSheet } from 'hooks/useSheet';
import { is } from 'immer/dist/internal';
import { StaffType } from 'models/Worksheet';
import { State } from 'modules/State';
import { Fraction } from 'opensheetmusicdisplay/build/dist/src';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  midiKeyNumberToBetterNoteName,
  midiKeyNumberToKeyType,
  midiKeyNumberToNote,
  Note,
  noteArrayToBinaryKeys,
  noteToBetterNoteName,
  noteToDiatonicNumber,
  noteToMidiKeyNumber,
} from 'utils/Note';
import {
  getBPM,
  getNoteSchedules,
  getTimeSignature,
  NoteSchedule,
} from 'utils/OSMD';

type PianoRollModalProps = {
  sheetKey: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};
type WrapProps = {
  visibility: boolean;
};
const Wrap = styled.div`
  position: relative;
  display: ${(props: WrapProps) => (props.visibility ? 'block' : 'none')};
`;

type ModalProps = {
  width: number;
  height: number;
};

const Barcolor = [
  '#C99DCE',
  '#f8d308',
  '#F8B197',
  '#f07e28',
  '#97EEF8',
  '#90E6AA',
  '#4bb748',
  '#F89797',
  '#2d76bb',
  '#9DAACE',
  '#6d429b',
  '#9DCCCE',
];

const Modal = styled.div`
  position: fixed;
  display: flex;
  width: ${(props: ModalProps) => props.width}px;
  height: ${(props: ModalProps) => props.height}px;
  top: 0px;
  left: 0px;
  background-color: #fff;
  z-index: 10;
  flex-direction: column;
`;

export default function PianoRollModal({
  sheetKey,
  visible,
  onVisibleChange,
}: PianoRollModalProps) {
  const piano = useSelector((state: State) => state.piano);
  const { sheet, isLoaded } = useSheet(sheetKey);

  const [guide, setGuide] = useState<GuideSchedule[]>([]);

  const { pressedKeys } = useIntergratedPressedKeys();

  const { noteSchedules, bpm, timeSignature } = useMemo(() => {
    if (isLoaded) {
      const osmd = sheet?.osmd;
      return {
        noteSchedules: getNoteSchedules(osmd),
        bpm: getBPM(osmd),
        timeSignature: getTimeSignature(osmd),
      };
    } else
      return {
        noteSchedules: null,
        bpm: null,
        timeSignature: null,
      };
  }, [isLoaded]);

  const lower = useMemo(() => {
    if (isLoaded && noteSchedules != null) {
      const min = noteSchedules.reduce(function (a, b) {
        return Math.min(a, noteToMidiKeyNumber(b.note));
      }, 200);
      return min;
    }
    return noteToMidiKeyNumber(piano.min);
  }, [isLoaded, noteSchedules]);

  const upper = useMemo(() => {
    if (isLoaded && noteSchedules != null) {
      const max = noteSchedules.reduce(function (a, b) {
        return Math.max(a, noteToMidiKeyNumber(b.note));
      }, 0);
      return max;
    }
    return noteToMidiKeyNumber(piano.max);
  }, [isLoaded, noteSchedules]);

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return (
    <Wrap visibility={visible}>
      <Modal width={dimensions.width} height={dimensions.height}>
      <ArrowLeftOutlined
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          fontSize: 30
        }}
      />
        <PianoRoll
          width={dimensions.width}
          height={680}
          noteSchedules={noteSchedules}
          bpm={bpm}
          timeSigniture={timeSignature}
          guide={guide}
          setGuide={setGuide}
          pressedKeys={pressedKeys}
        />
        <Piano
          lower={lower}
          upper={upper}
          guideFinger={guide}
          pressedKeys={pressedKeys}
        />
      </Modal>
    </Wrap>
  );
}

const PianoRollWrap = styled.div`
  flex: 1;
  height: 680px;
  background-color: white;
`;
type PianoRollProps = {
  width: number;
  height: number;
  noteSchedules: NoteSchedule[] | null;
  bpm: number | null;
  timeSigniture: Fraction | null;
  guide: GuideSchedule[];
  setGuide: (guide: GuideSchedule[]) => void;
  pressedKeys: Note[];
};

const measureLength = 1600;
const leading = 60;

export enum PlayState {
  PREPARE,
  PLAYING,
  HOLD,
  FINISH,
}

function PianoRoll({
  width,
  height,
  noteSchedules,
  bpm,
  timeSigniture,
  guide,
  setGuide,
  pressedKeys,
}: PianoRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playState, setPlayState] = useState<PlayState>(PlayState.PREPARE);

  
  const staffType = StaffType.RightHand; //TODO: get StaffType

  const velocity = useMemo(() => {
    if (timeSigniture !== null && bpm !== null) {
      return 80 / timeSigniture.Numerator / 60000;
    } else {
      return 0;
    }
  }, [timeSigniture, bpm]);

  const songLength = useMemo(() => {
    if (noteSchedules !== null && timeSigniture !== null) {
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

  const [count, setCount] = useState(0);
  const [before, setBefore] = useState<number | null>(null);
  const [playTime, setPlayTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      setCount((count) => {
        return count + 1;
      });
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const drawMeasure = (
    context: CanvasRenderingContext2D,
    playTime: number,
    InitX: number,
    bottomY: number,
  ) => {
    for (let i = -2; i < 3; i++) {
      const x =
        InitX +
        ((measureLength * (1 - playTime * velocity)) % measureLength) +
        i * measureLength;
      context.strokeStyle = 'black';
      context.beginPath();
      context.moveTo(x, bottomY - 4 * leading);
      context.lineTo(x, bottomY);
      context.stroke();
      for (let i = 0; i < 5; i++) {
        context.fillRect(x, bottomY - leading * i, measureLength, 1);
      }
      context.fillRect(
        x + measureLength,
        bottomY - 4 * leading,
        1,
        4 * leading,
      );
    }
  };
  const drawNote = (
    context: CanvasRenderingContext2D,
    playTime: number,
    cursorX: number,
    bottomY: number,
    timeSigniture: number,
    noteSchedule: NoteSchedule,
    staffType: StaffType
  ) => {
    const width = (measureLength * noteSchedule.length) / timeSigniture;
    const height = 60;
    const x =
      cursorX +
      measureLength *
        (noteSchedule.timing / timeSigniture - playTime * velocity);
    let y;
    switch(staffType){
      case StaffType.RightHand:
      case StaffType.BothHands:
      y =
        bottomY +
        height * 2 +
        height / 2 -
        (leading / 2) * (noteToDiatonicNumber(noteSchedule.note) - 24);
      break;
      case StaffType.LeftHand:
      y =
        bottomY +
        height * 2 +
        height / 2 -
        (leading / 2) * (noteToDiatonicNumber(noteSchedule.note) - 12);
    }

    const radius = height / 2;
    context.fillStyle = Barcolor[noteSchedule.note.pitchClass];
    context.beginPath();
    context.arc(x + radius, y + radius, radius, Math.PI / 2, (3 / 2) * Math.PI);
    context.arc(
      x + width - radius,
      y + radius,
      radius,
      (Math.PI * 3) / 2,
      Math.PI / 2,
    );
    context.lineTo(x + radius, y + height);
    context.fill();

    context.font = 'bold 30px Arial';
    context.fillStyle = '#FFFFFF';
    context.fillText(
      noteToBetterNoteName(noteSchedule.note),
      x + 20,
      y + height - 20,
    );
  };

  const drawCursor = (context: CanvasRenderingContext2D, cursorX: number) => {
    context.fillStyle = '#707070';
    context.fillRect(cursorX, 0, 3, context.canvas.height);
  };

  useEffect(() => {
    if (before === null) {
      setBefore(Date.now());
    } else {
      if (canvasRef.current === null) {
        return;
      }
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        const cursorX = 180;
        const bottom = 210 + 250;
        drawMeasure(context, playTime, cursorX, bottom);

        if (noteSchedules !== null && timeSigniture !== null)
          noteSchedules.forEach((schedule) => {
            drawNote(
              context,
              playTime,
              cursorX,
              bottom,
              timeSigniture.RealValue,
              schedule,
              staffType
            );
          });

        drawCursor(context, cursorX);
      }
      if (playState === PlayState.PLAYING || playState === PlayState.FINISH) {
        setPlayTime(playTime + Date.now() - before);
      }
      setBefore(Date.now());
    }
  }, [count]);

  useEffect(() => {
    setPlayTime(0);
    setBefore(null);
    nextHoldNote();
    nextHoldTiming();
  }, [noteSchedules]);

  const [guideSchedules, setGuideSchedules] = useState<GuideSchedule[]>([]);
  const [holdNote, setHoldNote] = useState<NoteSchedule[]>([]);
  const [holdTiming, setHoldTiming] = useState<number>(-1);

  useEffect(() => {
    if (noteSchedules === null) {
      return;
    }
    const newGuides: GuideSchedule[] = noteSchedules.map((noteSchedule) => {
      return {
        guide: {
          note: noteSchedule.note,
          fingerNumber: 1, // TODO: get fingernumber of xml
        },
        timing: noteSchedule.timing / velocity,
        length: noteSchedule.length / velocity,
      } as GuideSchedule;
    });
    setGuideSchedules(newGuides);
  }, [noteSchedules]);

  useEffect(() => {
    //TODO: 무지성 setGuide 수정
    setGuide(
      guideSchedules.filter(
        (guideSchedule) =>
          guideSchedule.timing <= playTime &&
          guideSchedule.timing + guideSchedule.length >= playTime,
      ),
    );
    if (playState !== PlayState.FINISH && playTime >= holdTiming) {
      setPlayState(PlayState.HOLD);
    }
  }, [count]);

  useEffect(() => {
    if (playState === PlayState.PREPARE || playState === PlayState.FINISH) {
      return;
    }
    if (holdTiming - 100 < playTime) {
      const beforeNote = guideSchedules
        .filter(
          (guideSchedule) =>
            guideSchedule.timing <= holdTiming - 1 &&
            guideSchedule.timing + guideSchedule.length >= holdTiming - 1,
        )
        .map((value) => value.guide.note);

      const IsContainHoldNote = holdNote.reduce((check, value) => {
        if (
          check &&
          pressedKeys
            .map((value) => noteToMidiKeyNumber(value))
            .contains(noteToMidiKeyNumber(value.note))
        ) {
          return true;
        } else {
          return false;
        }
      }, true);
      if (IsContainHoldNote) {
        console.log(holdNote, pressedKeys);
        const keys = [...pressedKeys];
        const a = noteArrayToBinaryKeys(
          beforeNote.concat(holdNote.map((value) => value.note)),
        );
        const b = noteArrayToBinaryKeys(keys);

        const weakCheck = b.reduce((check, value, index) => {
          if (check) {
            if (value && !a[index]) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        }, true);

        if (weakCheck) {
          setPlayState(PlayState.PLAYING);
          nextHoldNote();
          nextHoldTiming();
        }
      }
    }
  }, [pressedKeys]);

  const nextHoldTiming = () => {
    if (noteSchedules === null) {
      return;
    }
    for (let i = 0; i < noteSchedules.length; i++) {
      if (holdTiming < noteSchedules[i].timing / velocity) {
        console.log('holdTiming', noteSchedules[i].timing / velocity);
        setHoldTiming(noteSchedules[i].timing / velocity);
        return;
      }
    }
    setPlayState(PlayState.FINISH);
  };
  const nextHoldNote = () => {
    if (noteSchedules === null) {
      return;
    }
    for (let i = 0; i < noteSchedules.length; i++) {
      if (noteSchedules[i].timing / velocity > holdTiming) {
        setHoldNote((hold) => {
          const arr = [];
          for (
            let j = i;
            j < noteSchedules.length &&
            noteSchedules[i].timing === noteSchedules[j].timing;
            j++
          ) {
            arr.push(noteSchedules[j]);
          }
          hold.forEach((noteSchedule) => {
            if (
              noteSchedule.length + noteSchedule.timing >
              noteSchedules[i].timing
            ) {
              arr.push(noteSchedule);
            }
          });
          console.log('holdNote', arr);
          return arr;
        });
        break;
      }
    }
  };

  return (
    <PianoRollWrap>
      <canvas
        width={width}
        height={height}
        ref={canvasRef}
        onClick={() => {
          nextHoldNote();
          nextHoldTiming();
          setPlayState(PlayState.PLAYING);
        }}
      ></canvas>
    </PianoRollWrap>
  );
}

type GuideFinger = {
  note: Note;
  fingerNumber: number;
};

type GuideSchedule = {
  guide: GuideFinger;
  timing: number;
  length: number;
};

type PianoProps = {
  lower: number;
  upper: number;
  guideFinger: GuideSchedule[];
  pressedKeys: Note[];
};

const PianoWrap = styled.div`
  height: 300px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

function Piano({ lower, upper, guideFinger, pressedKeys }: PianoProps) {
  const keys = useMemo<KeyProp[]>(() => {
    const length = upper - lower + 1;
    const keys = Array.from({ length }, (_, ind) => ({
      midiKeyNumber: ind + lower,
      isPressed: false,
      fingerNumber: 0,
    }));

    pressedKeys.forEach((key) => {
      const midiKeyNumber = noteToMidiKeyNumber(key);
      if (midiKeyNumber >= lower && midiKeyNumber <= upper) {
        keys[midiKeyNumber - lower].isPressed = true;
      }
    });

    guideFinger.forEach((guide) => {
      const midiKeyNumber = noteToMidiKeyNumber(guide.guide.note);
      if (midiKeyNumber >= lower && midiKeyNumber <= upper) {
        keys[midiKeyNumber - lower].fingerNumber = guide.guide.fingerNumber;
      }
    });
    return keys;
  }, [lower, upper, pressedKeys, guideFinger]);

  return (
    <PianoWrap>
      {keys.map((key) => (
        <Key
          midiKeyNumber={key.midiKeyNumber}
          isPressed={key.isPressed}
          fingerNumber={key.fingerNumber}
        ></Key>
      ))}
    </PianoWrap>
  );
}
type KeyProp = {
  midiKeyNumber: number;
  isPressed: boolean;
  fingerNumber: number;
};

const WhiteKey = styled.div`
  display: flex;
  min-width: 100px;
  max-width: 100px;
  align-items: end;
  border: 1px solid black;
  align-items: flex-end;
  justify-content: center;
  user-drag: none;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
`;

const BlackKey = styled.div`
  position: relative;
  background: black;
  min-width: 70px;
  max-width: 70px;
  height: 60%;
  left: -35px;
  user-drag: none;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
`;
const BlackKeyWrap = styled.div`
  user-select: none;
  user-drag: none;
  width: 0px;
`;

const KeyText = styled.div`
  user-select: none;
  user-drag: none;
`;

function Key({ midiKeyNumber, isPressed, fingerNumber }: KeyProp) {
  let color = '';
  if (fingerNumber > 0) {
    color = Barcolor[midiKeyNumberToNote(midiKeyNumber).pitchClass];
  } else if (isPressed) {
    if (midiKeyNumberToKeyType(midiKeyNumber)) {
      color = '#803435';
    } else {
      color = '#fe656a';
    }
  } else {
    if (midiKeyNumberToKeyType(midiKeyNumber)) {
      color = 'black';
    } else {
      color = 'white';
    }
  }

  if (midiKeyNumberToKeyType(midiKeyNumber)) {
    return (
      <BlackKeyWrap draggable="false">
        <BlackKey
          draggable="false"
          style={{
            backgroundColor: color,
          }}
        />
      </BlackKeyWrap>
    );
  } else {
    return (
      <WhiteKey
        draggable="false"
        style={{
          backgroundColor: color,
        }}
      >
        <KeyText>{midiKeyNumberToBetterNoteName(midiKeyNumber)}</KeyText>
      </WhiteKey>
    );
  }
}

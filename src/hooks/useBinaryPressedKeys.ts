import { useMemo, useState } from 'react';
import {
  midiKeyNumberToNote,
  Note,
  noteToMidiKeyNumber,
  parseNoteNameToNote,
} from 'utils/Note';

type BinaryPressedKeysRes = {
  pressedKeys: Note[];
  onKeyDown: (midiKeyNumber: number) => void;
  onKeyUp: (midiKeyNumber: number) => void;
};

const noteA0 = parseNoteNameToNote('A0');
const noteA0MidiKeyNumber = noteToMidiKeyNumber(noteA0);

export function useBinaryPressedKeys(): BinaryPressedKeysRes {
  const [pressedBinaryKeys, setPressedBinaryKeys] = useState<boolean[]>(
    Array.from({ length: 88 }, () => false),
  );

  const onKeyDown = (midiKeyNumber: number) => {
    setPressedBinaryKeys((pressedKeys) => {
      const nextPressedBinaryKeys = [...pressedKeys];
      nextPressedBinaryKeys[midiKeyNumber - noteA0MidiKeyNumber] = true;
      return nextPressedBinaryKeys;
    });
  };

  const onKeyUp = (midiKeyNumber: number) => {
    setPressedBinaryKeys((pressedKeys) => {
      const nextPressedBinaryKeys = [...pressedKeys];
      nextPressedBinaryKeys[midiKeyNumber - noteA0MidiKeyNumber] = false;
      return nextPressedBinaryKeys;
    });
  };

  const pressedKeys = useMemo(() => {
    const pressed = [];
    for (let i = 0; i < 88; i++) {
      if (pressedBinaryKeys[i]) {
        pressed.push(midiKeyNumberToNote(noteA0MidiKeyNumber + i));
      }
    }
    return pressed;
  }, [pressedBinaryKeys]);

  return { pressedKeys, onKeyDown, onKeyUp };
}

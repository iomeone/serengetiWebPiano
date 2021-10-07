import { useMemo, useState } from 'react';
import {
  midiKeyNumberToNote,
  Note,
  noteToMidiKeyNumber,
  parseNoteNameToNote,
} from 'utils/Note';

type BinaryPressedKeysRes = {
  pressedKeys: Note[];
  pressedBinaryKeys: Uint8Array;
  onKeyDown: (midiKeyNumber: number) => void;
  onKeyUp: (midiKeyNumber: number) => void;
};

const noteA0 = parseNoteNameToNote('A0');
const noteA0MidiKeyNumber = noteToMidiKeyNumber(noteA0);

export function useBinaryPressedKeys(): BinaryPressedKeysRes {
  const [pressedBinaryKeys, setPressedBinaryKeys] = useState<Uint8Array>(
    Uint8Array.from({ length: 88 }, () => 0),
  );

  const onKeyDown = (midiKeyNumber: number) => {
    setPressedBinaryKeys((pressedKeys) => {
      const nextPressedKeys = pressedKeys.slice();
      nextPressedKeys[midiKeyNumber - noteA0MidiKeyNumber] = 1;
      return nextPressedKeys;
    });
  };

  const onKeyUp = (midiKeyNumber: number) => {
    setPressedBinaryKeys((pressedKeys) => {
      const nextPressedKeys = pressedKeys.slice();
      nextPressedKeys[midiKeyNumber - noteA0MidiKeyNumber] = 0;
      return nextPressedKeys;
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

  return { pressedKeys, pressedBinaryKeys, onKeyDown, onKeyUp };
}

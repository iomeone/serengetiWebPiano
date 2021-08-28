import { useEffect } from 'react';
import { keyBoardToNote } from 'utils/KeyMap';
import { Note, noteToMidiKeyNumber } from 'utils/Note';
import { useBinaryPressedKeys } from './useBinaryPressedKeys';

type KeyBoardMIDIRes = {
  pressedKeys: Note[];
  pressedBinaryKeys: boolean[];
};

export const useKeyBoardMIDI = (): KeyBoardMIDIRes => {
  const { pressedKeys, pressedBinaryKeys, onKeyDown, onKeyUp } =
    useBinaryPressedKeys();

  const keyDownHandler = ({ key, repeat }: KeyboardEvent) => {
    if (!repeat) {
      const note = keyBoardToNote(key);
      if (note !== null) {
        onKeyDown(noteToMidiKeyNumber(note));
      }
    }
  };

  const keyUpHandler = ({ key }: KeyboardEvent) => {
    const note = keyBoardToNote(key);
    if (note !== null) {
      onKeyUp(noteToMidiKeyNumber(note));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, []);

  return { pressedKeys, pressedBinaryKeys };
};

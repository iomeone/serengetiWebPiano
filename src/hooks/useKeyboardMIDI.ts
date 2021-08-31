import { useEffect } from 'react';
import { Articulation, NotePlayOption } from 'services/IAudioService';
import { keyBoardToNote } from 'utils/KeyMap';
import { Note, noteToMidiKeyNumber } from 'utils/Note';
import { useBinaryPressedKeys } from './useBinaryPressedKeys';

type KeyBoardMIDIRes = {
  pressedKeysByKeyboard: Note[];
  pressedBinaryKeysByKeyboard: boolean[];
};

export const useKeyboardMIDI = (play: ((note: NotePlayOption)=>Promise<void>) | null): KeyBoardMIDIRes => {
  const { pressedKeys, pressedBinaryKeys, onKeyDown, onKeyUp } =
    useBinaryPressedKeys();

  const keyDownHandler = ({ key, repeat }: KeyboardEvent) => {
    if (!repeat) {
      const note = keyBoardToNote(key);
      if (note !== null) {
        onKeyDown(noteToMidiKeyNumber(note));
        if(play !== null)
        play({
          articulation: Articulation.Legato,
          duration: 1,
          gain: 4,
          midiKeyNumber:noteToMidiKeyNumber(note),
        });
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

  return {
    pressedKeysByKeyboard: pressedKeys,
    pressedBinaryKeysByKeyboard: pressedBinaryKeys,
  };
};

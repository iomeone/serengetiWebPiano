import { Articulation, NotePlayOption } from 'services/IAudioService';
import { keyboardToNote } from 'utils/KeyMap';
import { Note, noteToMidiKeyNumber } from 'utils/Note';
import { useBinaryPressedKeys } from './useBinaryPressedKeys';
import { useKeyEvent } from './useKeyboard';

type KeyBoardMIDIRes = {
  pressedKeysByKeyboard: Note[];
  pressedBinaryKeysByKeyboard: Uint8Array;
};

export const useKeyboardMIDI = (
  play: ((note: NotePlayOption) => Promise<void>) | null,
): KeyBoardMIDIRes => {
  const keyDownHandler = (key: string) => {
    const note = keyboardToNote(key);
    if (note !== null) {
      onKeyDown(noteToMidiKeyNumber(note));
      if (play !== null) {
        play({
          articulation: Articulation.Legato,
          duration: 1,
          gain: 4,
          midiKeyNumber: noteToMidiKeyNumber(note),
        });
      }
    }
  };

  const keyUpHandler = (key: string) => {
    const note = keyboardToNote(key);
    if (note !== null) {
      onKeyUp(noteToMidiKeyNumber(note));
    }
  };

  useKeyEvent(keyDownHandler, keyUpHandler);

  const { pressedKeys, pressedBinaryKeys, onKeyDown, onKeyUp } =
    useBinaryPressedKeys();

  return {
    pressedKeysByKeyboard: pressedKeys,
    pressedBinaryKeysByKeyboard: pressedBinaryKeys,
  };
};

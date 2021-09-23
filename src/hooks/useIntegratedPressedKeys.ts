import { useMemo } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { NotePlayOption } from 'services/IAudioService';
import { binaryKeysToNoteArray, Note } from 'utils/Note';
import { useBinaryPressedKeys } from './useBinaryPressedKeys';
import { useFrontAudioService } from './useFrontAudioService';
import { useFrontMIDIAudio } from './useFrontMIDIAudio';
import { useKeyboardMIDI } from './useKeyboardMIDI';

type IntergratedPressedKeysRes = {
  initWithGesture: () => Promise<void>;
  isReady: boolean;
  pressedKeys: Note[];
  pressedBinaryKeys: boolean[];
  isMIDIConnected: boolean | null;
  isMIDISupported: boolean | null;
};

export function useIntergratedPressedKeys(): IntergratedPressedKeysRes {
  const { isReady, getOrCreateFrontAudioServiceWithGesture } =
    useFrontAudioService();
  const { onKeyUp, onKeyDown, pressedBinaryKeys } = useBinaryPressedKeys();
  const {
    isMIDIConnected,
    isMIDISupported,
    initWithGesture: initMIDIWithGesture,
  } = useFrontMIDIAudio(
    (note: number) => {
      onKeyDown(note);
    },
    (note: number) => {
      onKeyUp(note);
    },
  );

  const play = async (note: NotePlayOption) => {
    if (isReady) {
      const fas = await getOrCreateFrontAudioServiceWithGesture();
      fas.play(note);
    }
  };

  const { pressedBinaryKeysByKeyboard } = useKeyboardMIDI(play);

  const integratedPressedBinaryKeys = useMemo(() => {
    return pressedBinaryKeys.map(
      (value, index) => value || pressedBinaryKeysByKeyboard[index],
    );
  }, [pressedBinaryKeys, pressedBinaryKeysByKeyboard]);

  const integratedPressedKeys = useMemo(() => {
    return binaryKeysToNoteArray(integratedPressedBinaryKeys);
  }, [integratedPressedBinaryKeys]);

  const initWithGesture = async () => {
    await getOrCreateFrontAudioServiceWithGesture();
    await initMIDIWithGesture();
  };

  return {
    isReady,
    initWithGesture,
    isMIDIConnected,
    isMIDISupported,
    pressedKeys: integratedPressedKeys,
    pressedBinaryKeys: integratedPressedBinaryKeys,
  };
}

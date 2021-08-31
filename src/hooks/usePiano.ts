import { useMemo } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { NotePlayOption } from 'services/IAudioService';
import { binaryKeysToNoteArray, Note } from 'utils/Note';
import { useBinaryPressedKeys } from './useBinaryPressedKeys';
import { useFrontAudioService } from './useFrontAudioService';
import { useFrontMIDIAudio } from './useFrontMIDIAudio';
import { useKeyboardMIDI } from './useKeyboardMIDI';

type PianoRes = {
  preloadWithGesture: () => void;
  isLoaded: boolean;
  play: (note: NotePlayOption) => Promise<void>;
  pressedKeys: Note[];
  pressedBinaryKeys: boolean[];
};

export function usePiano(): PianoRes {
  const {
    frontAudioService,
    getOrCreateFrontAudioServiceWithGesture: preloadWithGesture,
  } = useFrontAudioService();
  const { onKeyUp, onKeyDown, pressedBinaryKeys } = useBinaryPressedKeys();
  const { initWithGesture, isMIDIConnected, isMIDISupported } =
    useFrontMIDIAudio(
      (note: number) => {
        onKeyDown(note);
      },
      (note: number) => {
        onKeyUp(note);
      },
    );

  const play = async (note: NotePlayOption) => {
    let fas: FrontAudioService | null = frontAudioService;
    if (frontAudioService === null) {
      fas = await preloadWithGesture();
    }

    fas?.play(note);
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

  const isLoaded = useMemo(() => {
    return frontAudioService !== null;
  }, [frontAudioService]);

  return {
    preloadWithGesture,
    isLoaded,
    play,
    pressedKeys: integratedPressedKeys,
    pressedBinaryKeys: integratedPressedBinaryKeys,
  };
}

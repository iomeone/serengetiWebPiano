import { useMemo } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { NotePlayOption } from 'services/IAudioService';
import { binaryKeysToNoteArray, Note } from 'utils/Note';
import { useBinaryPressedKeys } from './useBinaryPressedKeys';
import { useFrontAudioService } from './useFrontAudioService';
import { useFrontMIDIAudio } from './useFrontMIDIAudio';
import { useKeyboardMIDI } from './useKeyboardMIDI';

type IntergratedPressedKeysRes = {
  preloadWithGesture: () => Promise<FrontAudioService>;
  isLoaded: boolean;
  pressedKeys: Note[];
  pressedBinaryKeys: boolean[];
  initWithGesture: () => void;
  isMIDIConnected: boolean | null;
  isMIDISupported: boolean | null;
};

export function useIntergratedPressedKeys(): IntergratedPressedKeysRes {
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
    //fas 가 키보드로 눌렀을 때 계속 null임
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
    initWithGesture,
    isMIDIConnected,
    isMIDISupported,
    pressedKeys: integratedPressedKeys,
    pressedBinaryKeys: integratedPressedBinaryKeys,
  };
}

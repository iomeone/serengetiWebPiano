import { useMemo } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { NotePlayOption } from 'services/IAudioService';
import { useFrontAudioService } from './useFrontAudioService';

type PianoRes = {
  preloadWithGesture: () => void;
  isLoaded: boolean;
  play: (note: NotePlayOption) => Promise<void>;
};

export function usePiano(): PianoRes {
  const {
    frontAudioService,
    getOrCreateFrontAudioServiceWithGesture: preloadWithGesture,
  } = useFrontAudioService();

  const isLoaded = useMemo(() => {
    return frontAudioService !== null;
  }, [frontAudioService]);

  const play = async (note: NotePlayOption) => {
    let fas: FrontAudioService | null = frontAudioService;
    if (frontAudioService === null) {
      fas = await preloadWithGesture();
    }

    fas?.play(note);
  };

  return { preloadWithGesture, isLoaded, play };
}

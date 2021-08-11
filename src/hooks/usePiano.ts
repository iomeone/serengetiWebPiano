import { useMemo, useState } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { NotePlayOption } from 'services/IAudioService';

type PianoRes = {
  preloadWithGesture: () => void;
  isLoaded: boolean;
  play: (note: NotePlayOption) => Promise<void>;
};

export function usePiano(): PianoRes {
  const [audioService, setAudioService] = useState<FrontAudioService | null>(
    null,
  );
  const isLoaded = useMemo(() => {
    return audioService !== null;
  }, [audioService]);

  const preloadWithGesture = async (): Promise<FrontAudioService> => {
    const fas = new FrontAudioService();
    await fas.init();
    setAudioService(fas);
    return fas;
  };

  const play = async (note: NotePlayOption) => {
    let fas: FrontAudioService | null = null;

    if (audioService === null) {
      fas = await preloadWithGesture();
    } else {
      fas = audioService;
    }

    if (fas !== null) {
      fas.play(note);
    }
  };

  return { preloadWithGesture, isLoaded, play };
}

import { NotePlayOption } from 'services/IAudioService';
import { useFrontAudioService } from './useFrontAudioService';

type PianoRes = {
  preloadWithGesture: () => void;
  isLoaded: boolean;
  play: (note: NotePlayOption) => Promise<void>;
};

export function usePiano(): PianoRes {
  const {
    isReady,
    getOrCreateFrontAudioServiceWithGesture: preloadWithGesture,
  } = useFrontAudioService();

  const play = async (note: NotePlayOption) => {
    const fas = await preloadWithGesture();
    fas?.play(note);
  };

  return { preloadWithGesture, isLoaded: isReady, play };
}

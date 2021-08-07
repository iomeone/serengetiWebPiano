import { useState } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { NotePlayOption } from 'services/IAudioService';

export function usePiano(): (note: NotePlayOption) => Promise<void> {
  const [audioService, setAudioService] = useState<FrontAudioService | null>(
    null,
  );

  const initAudio = async (): Promise<FrontAudioService> => {
    const fas = new FrontAudioService();
    await fas.init();
    setAudioService(fas);
    return fas;
  };

  const play = async (note: NotePlayOption) => {
    let fas: FrontAudioService | null = null;

    if (audioService === null) {
      fas = await initAudio();
    } else {
      fas = audioService;
    }

    if (fas !== null) {
      fas.play(note);
    }
  };

  return play;
}

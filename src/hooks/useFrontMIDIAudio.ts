import { State } from 'modules/State';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FrontAudioService } from 'services/FrontAudioService';
import { NoteOffListener, NoteOnListener } from 'services/FrontMIDIService';
import { useFrontAudioService } from './useFrontAudioService';
import { useFrontMIDIService } from './useFrontMIDIService';

type FrontMIDIAudioRes = {
  isMIDISupported: boolean | null;
  isMIDIConnected: boolean | null;
  initWithGesture: () => Promise<void>;
};

const MAX_VOLUME = 5;

export function useFrontMIDIAudio(
  onNoteOn: NoteOnListener | null,
  onNoteOff: NoteOffListener | null,
): FrontMIDIAudioRes {
  const { getOrCreateFrontAudioServiceWithGesture, isReady } =
    useFrontAudioService();

  const { frontMIDIService, isMIDISupported, isMIDIConnected } =
    useFrontMIDIService(onNoteOn, onNoteOff);

  const volume = useSelector((state: State) => state.piano.volume);
  const calcGain = (vel: number) => (vel * volume * MAX_VOLUME) / 127;

  const init = (frontAudioService: FrontAudioService) => {
    const input: { onmidimessage: any } = { onmidimessage: null };
    frontAudioService.Player?.listenToMidi(input, {
      gain: calcGain,
    });
    if (frontMIDIService !== null) {
      frontMIDIService.MessageHandler = (message: any) => {
        input.onmidimessage(message);
      };
    }
  };

  useEffect(() => {
    if (isReady) {
      initWithGesture();
    }
  }, [isReady, volume]);

  const initWithGesture = async () => {
    const fas = await getOrCreateFrontAudioServiceWithGesture();
    init(fas);
  };

  return { initWithGesture, isMIDISupported, isMIDIConnected };
}

import { useEffect } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { NoteOffListener, NoteOnListener } from 'services/FrontMIDIService';
import { useFrontAudioService } from './useFrontAudioService';
import { useFrontMIDIService } from './useFrontMIDIService';

type FrontMIDIAudioRes = {
  isMIDISupported: boolean | null;
  isMIDIConnected: boolean | null;
  initWithGesture: () => Promise<void>;
};

const MAX_VOLUME = 8;

export function useFrontMIDIAudio(
  onNoteOn: NoteOnListener | null,
  onNoteOff: NoteOffListener | null,
): FrontMIDIAudioRes {
  const { getOrCreateFrontAudioServiceWithGesture } = useFrontAudioService();

  const { frontMIDIService, isMIDISupported, isMIDIConnected } =
    useFrontMIDIService(onNoteOn, onNoteOff);

  const init = (frontAudioService: FrontAudioService) => {
    const input: { onmidimessage: any } = { onmidimessage: null };
    frontAudioService.Player?.listenToMidi(input, {
      gain: (vel: number) => (vel * MAX_VOLUME) / 127,
    });
    if (frontMIDIService !== null) {
      frontMIDIService.MessageHandler = (message: any) => {
        input.onmidimessage(message);
      };
    }
  };

  const initWithGesture = async () => {
    const fas = await getOrCreateFrontAudioServiceWithGesture();
    init(fas);
  };

  return { initWithGesture, isMIDISupported, isMIDIConnected };
}

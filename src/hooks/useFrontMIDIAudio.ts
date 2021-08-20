import { NoteOffListener, NoteOnListener } from 'services/FrontMIDIService';
import { useFrontAudioService } from './useFrontAudioService';
import { useFrontMIDIService } from './useFrontMIDIService';

type FrontMIDIAudioRes = {
  isMIDISupported: boolean | null;
  isMIDIConnected: boolean | null;
  initWithGesture: () => void;
};

export function useFrontMIDIAudio(
  onNoteOn: NoteOnListener | null,
  onNoteOff: NoteOffListener | null,
): FrontMIDIAudioRes {
  const { frontAudioService, getOrCreateFrontAudioServiceWithGesture } =
    useFrontAudioService();

  const { frontMIDIService, isMIDISupported, isMIDIConnected } =
    useFrontMIDIService(onNoteOn, onNoteOff);

  const initWithGesture = async () => {
    let fas = frontAudioService;
    if (fas === null) {
      fas = await getOrCreateFrontAudioServiceWithGesture();
    }
    const input: { onmidimessage: any } = { onmidimessage: null };
    fas?.Player?.listenToMidi(input, {
      gain: (vel: number) => (vel * 5) / 127,
    });
    if (frontMIDIService !== null) {
      frontMIDIService.MessageHandler = (message: any) => {
        input.onmidimessage(message);
      };
    }
  };
  return { initWithGesture, isMIDISupported, isMIDIConnected };
}

import { useEffect, useState } from 'react';
import {
  FrontMIDIService,
  NoteOffListener,
  NoteOnListener,
} from 'services/FrontMIDIService';

type FrontMIDIServiceRes = {
  frontMIDIService: FrontMIDIService | null;
  isMIDISupported: boolean | null;
  isMIDIConnected: boolean | null;
};

export function useFrontMIDIService(
  onNoteOn: NoteOnListener | null,
  onNoteOff: NoteOffListener | null,
): FrontMIDIServiceRes {
  const [frontMIDIService, setFrontMIDIService] =
    useState<FrontMIDIService | null>(null);

  const [isMIDISupported, setIsMIDISupported] = useState<boolean | null>(null);
  const [isMIDIConnected, setIsMIDIConnected] = useState<boolean | null>(null);

  const init = async () => {
    const fms = new FrontMIDIService();
    await fms.init();
    setIsMIDISupported(fms.IsMIDISupported);
    setIsMIDIConnected(fms.IsMIDIConnected);
    setFrontMIDIService(fms);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (frontMIDIService !== null) {
      frontMIDIService.NoteOnListener = onNoteOn;
      frontMIDIService.NoteOffListener = onNoteOff;
    }
  }, [frontMIDIService, onNoteOn, onNoteOff]);

  return { frontMIDIService, isMIDISupported, isMIDIConnected };
}

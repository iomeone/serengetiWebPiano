import { useState } from 'react';
import { FrontAudioService } from 'services/FrontAudioService';
import { useAudioContext } from './useAudioContext';

type FrontAudioServiceRes = {
  frontAudioService: FrontAudioService | null;
  getOrCreateFrontAudioServiceWithGesture: () => Promise<FrontAudioService>;
};

export function useFrontAudioService(): FrontAudioServiceRes {
  const { getOrCreateAudioContextWithGesture } = useAudioContext();
  const [frontAudioService, setFrontAudioService] =
    useState<FrontAudioService | null>(null);

  const getOrCreateFrontAudioServiceWithGesture =
    async (): Promise<FrontAudioService> => {
      const audioContext = await getOrCreateAudioContextWithGesture();
      const fas = new FrontAudioService();
      await fas.init(audioContext);
      setFrontAudioService(fas);
      return fas;
    };

  return { frontAudioService, getOrCreateFrontAudioServiceWithGesture };
}

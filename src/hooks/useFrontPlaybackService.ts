import { useState } from 'react';
import { FrontPlaybackService } from 'services/FrontPlaybackService';
import { useAudioContext } from './useAudioContext';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';

type FrontPlaybackServiceRes = {
  frontPlaybackService: FrontPlaybackService | null;
  getOrCreateFrontPlaybackServiceWithGesture: (
    osmd: OSMD,
  ) => Promise<FrontPlaybackService>;
};

export function useFrontPlaybackService(): FrontPlaybackServiceRes {
  const { getOrCreateAudioContextWithGesture } = useAudioContext();
  const [frontPlaybackService, setFrontPlaybackService] =
    useState<FrontPlaybackService | null>(null);

  const getOrCreateFrontPlaybackServiceWithGesture = async (
    osmd: OSMD,
  ): Promise<FrontPlaybackService> => {
    const audioContext = await getOrCreateAudioContextWithGesture();
    const fps = new FrontPlaybackService();
    await fps.init(osmd, audioContext);
    setFrontPlaybackService(fps);
    return fps;
  };

  return { frontPlaybackService, getOrCreateFrontPlaybackServiceWithGesture };
}

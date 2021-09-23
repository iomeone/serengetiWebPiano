import { setAudioService } from 'modules/audio';
import { State } from 'modules/State';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FrontAudioService } from 'services/FrontAudioService';
import { AudioServiceType, IAudioService } from 'services/IAudioService';
import { IAudioContext } from 'standardized-audio-context';
import { useAudioContext } from './useAudioContext';

type FrontAudioServiceRes = {
  audioService: IAudioService | null;
  isReady: boolean;
  getOrCreateFrontAudioServiceWithGesture: () => Promise<FrontAudioService>;
};

export function useFrontAudioService(): FrontAudioServiceRes {
  const dispatch = useDispatch();

  const { audioContext, getOrCreateAudioContextWithGesture } =
    useAudioContext();
  const audioService = useSelector((state: State) => state.audio.audioService);
  const serviceType = useSelector(
    (state: State) => state.audio.audioServiceType,
  );

  const isReady = useMemo(() => {
    return (
      audioService !== null && serviceType === AudioServiceType.FrontService
    );
  }, [audioService, serviceType]);

  const create = async (
    audioContext: IAudioContext,
  ): Promise<FrontAudioService> => {
    const fas = new FrontAudioService();
    await fas.init(audioContext);
    dispatch(setAudioService(fas, AudioServiceType.FrontService));
    return fas;
  };

  const getOrCreateFrontAudioServiceWithGesture =
    async (): Promise<FrontAudioService> => {
      if (isReady) return audioService as FrontAudioService;
      const ac = await getOrCreateAudioContextWithGesture();
      return await create(ac);
    };

  return { audioService, isReady, getOrCreateFrontAudioServiceWithGesture };
}

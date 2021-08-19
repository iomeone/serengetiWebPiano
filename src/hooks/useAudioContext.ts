import { setAudioContext } from 'modules/audio';
import { State } from 'modules/State';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IAudioContext, AudioContext } from 'standardized-audio-context';

type AudioContextRes = {
  audioContext: IAudioContext | null;
  getOrCreateAudioContextWithGesture: () => Promise<IAudioContext>;
};

export function useAudioContext(): AudioContextRes {
  const audioContext = useSelector((state: State) => state.audio.audioContext);
  const isLoaded = useMemo(() => audioContext !== null, [audioContext]);
  const dispatch = useDispatch();

  const getOrCreateAudioContextWithGesture =
    async (): Promise<IAudioContext> => {
      let context: IAudioContext | null = audioContext;
      if (!isLoaded) {
        context = new AudioContext();
        dispatch(setAudioContext(context));
      }
      return context as IAudioContext;
    };

  return { audioContext, getOrCreateAudioContextWithGesture };
}

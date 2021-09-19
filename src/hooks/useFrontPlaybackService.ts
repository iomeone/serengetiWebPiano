import { useMemo } from 'react';
import { FrontPlaybackService } from 'services/FrontPlaybackService';
import { useAudioContext } from './useAudioContext';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'modules/State';
import { Sheet } from 'models/Sheet';
import {
  IPlaybackService,
  PlaybackServiceType,
  PlaybackState,
} from 'services/IPlaybackService';
import {
  setCurrentMeasureInd,
  setMetronomeState,
  setPlaybackService,
  setPlaybackState,
} from 'modules/audio';

type FrontPlaybackServiceRes = {
  playbackService: IPlaybackService | null;
  getOrCreateFrontPlaybackServiceWithGesture: () => Promise<FrontPlaybackService | null>;
};

export function useFrontPlaybackService(
  sheetKey: string,
): FrontPlaybackServiceRes {
  const { getOrCreateAudioContextWithGesture } = useAudioContext();
  const sheet: Sheet | null = useSelector(
    (state: State) => state.audio.sheets[sheetKey] ?? null,
  );
  const playbackService = useMemo(
    () => (sheet !== null ? sheet.playbackService : null),
    [sheet],
  );
  const playbackServiceType = useMemo(
    () => (sheet !== null ? sheet.playbackServiceType : null),
    [sheet],
  );
  const dispatch = useDispatch();

  const createFrontPlaybackService =
    async (): Promise<FrontPlaybackService> => {
      const service = new FrontPlaybackService();
      await service.init(
        sheet.osmd,
        await getOrCreateAudioContextWithGesture(),
      );

      dispatch(
        setPlaybackService(sheetKey, service, PlaybackServiceType.FrontService),
      );
      dispatch(setPlaybackState(sheetKey, PlaybackState.INIT));
      service.addPlaybackStateListener((state) => {
        dispatch(setPlaybackState(sheetKey, state));
      });
      service.addIteratorListener((iterator) => {
        dispatch(setCurrentMeasureInd(sheetKey, iterator.CurrentMeasureIndex));
      });
      service.addMetronomeListener((metronomeState) => {
        dispatch(setMetronomeState(sheetKey, metronomeState));
      });

      return service;
    };

  const getOrCreateFrontPlaybackServiceWithGesture =
    async (): Promise<FrontPlaybackService | null> => {
      if (playbackService !== null) {
        if (playbackServiceType !== PlaybackServiceType.FrontService) {
          playbackService.stop();

          return await createFrontPlaybackService();
        } else {
          return playbackService as FrontPlaybackService;
        }
      } else {
        return await createFrontPlaybackService();
      }
    };

  return { playbackService, getOrCreateFrontPlaybackServiceWithGesture };
}

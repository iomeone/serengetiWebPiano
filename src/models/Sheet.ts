import {
  IPlaybackService,
  PlaybackServiceType,
  PlaybackState,
} from 'services/IPlaybackService';

export type Sheet = {
  osmd: any;
  title: string | null;
  loaded: boolean;
  playbackService: IPlaybackService | null;
  playbackServiceType: PlaybackServiceType | null;
  currentMeasureInd: number | null;
  playbackState: PlaybackState | null;
  metronomeState: boolean;
};

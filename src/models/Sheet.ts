import {
  IPlaybackService,
  PlaybackServiceType,
} from 'services/IPlaybackService';

export type Sheet = {
  osmd: any;
  title: string | null;
  loaded: boolean;
  playbackService: IPlaybackService | null;
  playbackServiceType: PlaybackServiceType | null;
};

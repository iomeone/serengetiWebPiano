import { MusicPartManagerIterator } from 'opensheetmusicdisplay/build/dist/src';

export enum PlaybackState {
  INIT = 'INIT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export enum PlaybackServiceType {
  FrontService = 'FrontService',
}

export interface IPlaybackService {
  play: () => void;
  pause: () => void;
  stop: () => void;
  startMetronome: () => void;
  stopMetronome: () => void;
  jumpToMeasure: (measureInd: number) => void;
  addIteratorListener(
    listener: (iterator: MusicPartManagerIterator) => void,
  ): void;
  addPlaybackStateListener: (listener: (state: PlaybackState) => void) => void;
}

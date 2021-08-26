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
}

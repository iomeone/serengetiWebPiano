import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';

export interface IPlaybackService {
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

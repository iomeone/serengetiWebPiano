import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import PlaybackEngine from 'osmd-audio-player';
import { IPlaybackService } from './IPlaybackService';
import { IAudioContext } from 'standardized-audio-context';

export class FrontPlaybackService implements IPlaybackService {
  private osmd: OSMD | null = null;
  private engine: PlaybackEngine | null = null;
  private bpm: number = 120;
  public async init(osmd: OSMD, audioContext: IAudioContext) {
    this.osmd = osmd;
    this.engine = new PlaybackEngine(audioContext);
    await this.engine.loadScore(osmd as any);
  }

  public play() {
    if (this.engine !== null) {
      this.engine.setBpm(this.bpm);
      this.engine.play();
    }
  }
  public pause() {}
  public stop() {}
  public resume() {}
}

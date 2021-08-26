import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import PlaybackEngine from 'osmdAudioPlayer';
import { IPlaybackService, PlaybackState } from './IPlaybackService';
import { IAudioContext } from 'standardized-audio-context';
import { PlaybackState as EnginePlaybackState } from 'osmdAudioPlayer/PlaybackEngine';

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
  public pause() {
    if (this.engine !== null) {
      this.engine.pause();
    }
  }
  public stop() {
    if (this.engine !== null) {
      this.engine.stop();
    }
  }

  public jumpToMeasure(measureInd: number) {
    if (this.osmd !== null && this.engine !== null) {
      this.engine.pause();
      this.engine.jumpToMeasure(measureInd);
      this.engine.play();
      this.osmd.cursor.show();
    }
  }

  public getState(): PlaybackState | null {
    if (this.engine !== null) {
      switch (this.engine.state) {
        case EnginePlaybackState.INIT:
          return PlaybackState.INIT;
        case EnginePlaybackState.PLAYING:
          return PlaybackState.PLAYING;
        case EnginePlaybackState.PAUSED:
          return PlaybackState.PAUSED;
        case EnginePlaybackState.STOPPED:
          return PlaybackState.STOPPED;
      }
    }
    return null;
  }
}

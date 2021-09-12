import {
  MusicPartManagerIterator,
  OpenSheetMusicDisplay as OSMD,
} from 'opensheetmusicdisplay';
import PlaybackEngine from 'osmdAudioPlayer';
import { IPlaybackService, PlaybackState } from './IPlaybackService';
import { IAudioContext } from 'standardized-audio-context';
import {
  PlaybackEvent,
  PlaybackState as EnginePlaybackState,
} from 'osmdAudioPlayer/PlaybackEngine';

export class FrontPlaybackService implements IPlaybackService {
  private osmd: OSMD | null = null;
  private engine: PlaybackEngine | null = null;

  public async init(osmd: OSMD, audioContext: IAudioContext) {
    this.osmd = osmd;
    this.engine = new PlaybackEngine(audioContext);
    await this.engine.loadScore(osmd as any);
  }

  public startMetronome() {
    if (this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.startMetronome();
  }

  public stopMetronome() {
    if (this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.stopMetronome();
  }

  public play() {
    if (this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.play();
  }
  public pause() {
    if (this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.pause();
  }
  public stop() {
    if (this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.stop();
  }

  public jumpToMeasure(measureInd: number) {
    if (this.osmd === null || this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.pause();
    this.engine.jumpToMeasure(measureInd);
    this.engine.play();
    this.osmd.cursor.show();
  }

  public addMetronomeListener(listener: (metronome: boolean) => void) {
    if (this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.on(PlaybackEvent.METRONOME, listener);
  }

  public addIteratorListener(
    listener: (iterator: MusicPartManagerIterator) => void,
  ) {
    if (this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.on(PlaybackEvent.ITERATION, listener);
  }

  public addPlaybackStateListener(listener: (state: PlaybackState) => void) {
    if (this.engine === null)
      throw new Error('osmd or playback engine is not initalized');

    this.engine.on(PlaybackEvent.STATE_CHANGE, (state: EnginePlaybackState) => {
      let res: PlaybackState | null = null;
      switch (state) {
        case EnginePlaybackState.INIT:
          res = PlaybackState.INIT;
          break;
        case EnginePlaybackState.PLAYING:
          res = PlaybackState.PLAYING;
          break;
        case EnginePlaybackState.PAUSED:
          res = PlaybackState.PAUSED;
          break;
        case EnginePlaybackState.STOPPED:
          res = PlaybackState.STOPPED;
          break;
      }
      listener(res);
    });
  }
}

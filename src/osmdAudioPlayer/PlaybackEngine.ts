import PlaybackScheduler from './PlaybackScheduler';
import {
  Instrument,
  MusicSheet,
  Note,
  OpenSheetMusicDisplay,
  Voice,
} from 'opensheetmusicdisplay';
import { SoundfontPlayer } from './players/SoundfontPlayer';
import {
  InstrumentPlayer,
  PlaybackInstrument,
} from './players/InstrumentPlayer';
import {
  ArticulationStyle,
  NotePlaybackInstruction,
} from './players/NotePlaybackOptions';
import {
  getNoteDuration,
  getNoteVolume,
  getNoteArticulationStyle,
} from './internals/noteHelpers';
import { EventEmitter } from '../utils/EventEmitter';
import { AudioContext, IAudioContext } from 'standardized-audio-context';

export enum PlaybackState {
  INIT = 'INIT',
  PLAYING = 'PLAYING',
  STOPPED = 'STOPPED',
  PAUSED = 'PAUSED',
}

export enum PlaybackEvent {
  STATE_CHANGE = 'STATE_CHANGE',
  ITERATION = 'ITERATION',
  METRONOME = 'METRONOME',
}

interface PlaybackSettings {
  bpm: number;
  masterVolume: number;
}

type MetronomeInstrumentInfo = {
  id: number;
  note: number;
};

export default class PlaybackEngine {
  private ac: IAudioContext;
  private defaultBpm: number = 100;
  private osmd: OpenSheetMusicDisplay | null;
  private sheet: MusicSheet | null;
  private denominator: number | null;
  private scheduler: PlaybackScheduler | null;
  private instrumentPlayer: InstrumentPlayer;
  private events: EventEmitter<PlaybackEvent>;
  private compensateDelay: number;
  private currentIterationStep: number;

  private timeoutHandles: number[];

  public playbackSettings: PlaybackSettings;
  public state?: PlaybackState;
  public availableInstruments: PlaybackInstrument[];
  public scoreInstruments: Instrument[] = [];
  public ready: boolean = false;

  public metronomeInstrumentInfoMap: {
    [key: string]: MetronomeInstrumentInfo;
  } = {
    stick: {
      id: 113,
      note: 40,
    },
  };
  public metronomeInstrument = 'stick';

  constructor(
    context: IAudioContext = new AudioContext(),
    instrumentPlayer: InstrumentPlayer = new SoundfontPlayer(),
  ) {
    this.ac = context;

    this.instrumentPlayer = instrumentPlayer;
    this.instrumentPlayer.init(this.ac);

    this.availableInstruments = this.instrumentPlayer.instruments;

    this.events = new EventEmitter();

    this.osmd = null;
    this.sheet = null;
    this.denominator = null;
    this.scheduler = null;
    this.compensateDelay = 30;
    this.currentIterationStep = 0;

    this.timeoutHandles = [];

    this.playbackSettings = {
      bpm: this.defaultBpm,
      masterVolume: 1,
    };

    this.setState(PlaybackState.INIT);
  }

  get wholeNoteLength(): number {
    if (this.denominator === null) throw Error('Denominator is null');
    return Math.round(
      (60 / this.playbackSettings.bpm) * this.denominator * 1000,
    );
  }

  public getPlaybackInstrument(voiceId: number): PlaybackInstrument | null {
    if (!this.sheet) return null;
    const voice = this.sheet.Instruments.flatMap((i) => i.Voices).find(
      (v) => v.VoiceId === voiceId,
    );
    if (this.availableInstruments === undefined) return null;
    return (
      this.availableInstruments.find(
        (i) => i.midiId === (voice as any).midiInstrumentId,
      ) ?? null
    );
  }

  public async setInstrument(
    voice: Voice,
    midiInstrumentId: number,
  ): Promise<void> {
    await this.instrumentPlayer.load(midiInstrumentId);
    (voice as any).midiInstrumentId = midiInstrumentId;
  }

  async loadScore(osmd: OpenSheetMusicDisplay): Promise<void> {
    this.osmd = osmd;
    this.ready = false;
    this.sheet = osmd.Sheet;
    this.scoreInstruments = this.sheet.Instruments;
    this.denominator = this.sheet.SheetPlaybackSetting.rhythm.Denominator;
    if (this.sheet.HasBPMInfo) {
      this.setBpm(this.sheet.DefaultStartTempoInBpm);
    }

    await this.loadInstruments();
    this.initInstruments();

    this.scheduler = new PlaybackScheduler(
      this.denominator,
      this.wholeNoteLength,
      this.ac,
      (delay, index, notes) => this.notePlaybackCallback(delay, index, notes),
      (delay) => this.metronomeCallback(delay),
    );
    this.countAndSetIterationSteps();
    this.ready = true;
    this.setState(PlaybackState.STOPPED);
  }

  private initInstruments() {
    if (this.sheet === null) throw Error('Sheet is null');
    for (const i of this.sheet.Instruments) {
      for (const v of i.Voices) {
        (v as any).midiInstrumentId = i.MidiInstrumentId;
      }
    }
  }

  private async loadInstruments() {
    if (this.sheet === null) throw Error('Sheet is null');
    let playerPromises: Promise<void>[] = [];
    for (const i of this.sheet.Instruments) {
      const pbInstrument = this.availableInstruments.find(
        (pbi) => pbi.midiId === i.MidiInstrumentId,
      );
      if (pbInstrument == null) {
        this.fallbackToPiano(i);
      }
      playerPromises.push(this.instrumentPlayer.load(i.MidiInstrumentId));
    }
    await Promise.all(playerPromises);

    for (const info of Object.values(this.metronomeInstrumentInfoMap)) {
      await this.instrumentPlayer.load(info.id);
    }
  }

  private fallbackToPiano(i: Instrument) {
    console.warn(
      `Can't find playback instrument for midiInstrumentId ${i.MidiInstrumentId}. Falling back to piano`,
    );
    i.MidiInstrumentId = 0;

    if (this.availableInstruments.find((i) => i.midiId === 0) == null) {
      throw new Error('Piano fallback failed, grand piano not supported');
    }
  }

  public async play() {
    if (this.osmd === null) throw Error('OpenSheetMusicDisplay is null');
    if (this.scheduler === null) throw Error('Scheduler is null');

    this.setState(PlaybackState.PLAYING);
    this.osmd.cursor.hide();
    this.osmd.cursor.show();
    this.scheduler.start();
  }

  public async stop() {
    if (this.osmd === null) throw Error('OpenSheetMusicDisplay is null');
    if (this.scheduler === null) throw Error('Scheduler is null');

    this.setState(PlaybackState.STOPPED);
    this.stopPlayers();
    this.clearTimeouts();
    this.scheduler.reset();
    this.osmd.cursor.reset();
    this.currentIterationStep = 0;
    this.osmd.cursor.hide();
  }

  public pause() {
    if (this.sheet === null) throw Error('Cursor is null');
    if (this.scheduler === null) throw Error('Scheduler is null');

    this.setState(PlaybackState.PAUSED);
    this.stopPlayers();
    this.scheduler.setIterationStep(this.currentIterationStep);
    this.scheduler.pause();
    this.clearTimeouts();
  }

  public jumpToMeasure(measureInd: number) {
    if (this.osmd === null) throw Error('OpenSheetMusicDisplay is null');
    if (this.scheduler === null) throw Error('Scheduler is null');

    this.pause();
    if (this.osmd.cursor.iterator.CurrentMeasureIndex >= measureInd) {
      this.osmd.cursor.reset();
      this.currentIterationStep = 0;
    }
    while (this.osmd.cursor.iterator.CurrentMeasureIndex < measureInd) {
      this.osmd.cursor.next();
      ++this.currentIterationStep;
    }
    let schedulerStep = this.currentIterationStep;
    this.scheduler.setIterationStep(schedulerStep);
  }

  public startMetronome() {
    if (this.scheduler === null) throw Error('Scheduler is null');
    this.scheduler.startMetronome();
    this.events.emit(PlaybackEvent.METRONOME, true);
  }

  public stopMetronome() {
    if (this.scheduler === null) throw Error('Scheduler is null');
    this.scheduler.stopMetronome();
    this.events.emit(PlaybackEvent.METRONOME, false);
  }

  public setBpm(bpm: number) {
    this.playbackSettings.bpm = bpm;
    if (this.scheduler) this.scheduler.wholeNoteLength = this.wholeNoteLength;
  }

  public getBpm() {
    return this.playbackSettings.bpm;
  }

  public on(event: PlaybackEvent, cb: (...args: any[]) => void) {
    this.events.on(event, cb);
  }

  private countAndSetIterationSteps() {
    if (this.osmd === null) throw Error('OpenSheetMusicDisplay is null');
    if (this.scheduler === null) throw Error('Scheduler is null');

    this.osmd.cursor.reset();
    let steps = 0;
    while (!this.osmd.cursor.Iterator.EndReached) {
      if (this.osmd.cursor.Iterator.CurrentVoiceEntries) {
        this.scheduler.loadNotes(this.osmd.cursor.Iterator.CurrentVoiceEntries);
      }
      this.osmd.cursor.next();
      ++steps;
    }
    this.osmd.cursor.reset();
  }

  private metronomeCallback(audioDelay: number) {
    // setTimeout(() => {
    //   console.log('beat!');
    // }, audioDelay * 1000);
    const info = this.metronomeInstrumentInfoMap[this.metronomeInstrument];
    if (info === undefined) throw Error('there is no metronome instrument');
    this.instrumentPlayer.schedule(info.id, this.ac.currentTime + audioDelay, [
      {
        articulation: ArticulationStyle.None,
        duration: 1,
        gain: 1.5,
        note: info.note,
      },
    ]);
  }

  private notePlaybackCallback(
    audioDelay: any,
    stepIndex: number,
    notes: Note[],
  ) {
    if (this.state !== PlaybackState.PLAYING) return;
    let scheduledNotes: Map<number, NotePlaybackInstruction[]> = new Map();

    for (let note of notes) {
      if (note.isRest()) {
        continue;
      }
      const noteDuration = getNoteDuration(note, this.wholeNoteLength);
      if (noteDuration === 0) continue;
      const noteVolume = getNoteVolume(note);
      const noteArticulation = getNoteArticulationStyle(note);

      const midiPlaybackInstrument = (note as any).ParentVoiceEntry.ParentVoice
        .midiInstrumentId;
      const fixedKey =
        note.ParentVoiceEntry.ParentVoice.Parent.SubInstruments[0].fixedKey ||
        0;

      if (!scheduledNotes.has(midiPlaybackInstrument)) {
        scheduledNotes.set(midiPlaybackInstrument, []);
      }

      scheduledNotes.get(midiPlaybackInstrument)?.push({
        note: note.halfTone - fixedKey * 12,
        duration: noteDuration / 1000,
        gain: noteVolume,
        articulation: noteArticulation,
      });
    }

    for (const [midiId, notes] of scheduledNotes) {
      this.instrumentPlayer.schedule(
        midiId,
        this.ac.currentTime + audioDelay,
        notes,
      );
    }

    this.timeoutHandles.push(
      window.setTimeout(
        () => this.iterationCallback(stepIndex),
        Math.max(0, audioDelay * 1000 - this.compensateDelay),
      ),
      window.setTimeout(
        () =>
          this.events.emit(
            PlaybackEvent.ITERATION,
            this.osmd?.cursor?.Iterator,
          ),
        audioDelay * 1000,
      ),
    );
  }

  private setState(state: PlaybackState) {
    this.state = state;
    this.events.emit(PlaybackEvent.STATE_CHANGE, state);
  }

  private stopPlayers() {
    if (this.sheet === null) throw Error('Sheet is null');

    for (const i of this.sheet.Instruments) {
      for (const v of i.Voices) {
        this.instrumentPlayer.stop((v as any).midiInstrumentId);
      }
    }
  }

  // Used to avoid duplicate cursor movements after a rapid pause/resume action
  private clearTimeouts() {
    for (let h of this.timeoutHandles) {
      clearTimeout(h);
    }
    this.timeoutHandles = [];
  }

  private iterationCallback(stepIndex: number) {
    if (this.osmd === null) throw Error('OpenSheetMusicDisplay is null');
    if (this.state !== PlaybackState.PLAYING) return;
    while (this.currentIterationStep < stepIndex) {
      this.osmd.cursor.next();
      ++this.currentIterationStep;
    }
  }
}

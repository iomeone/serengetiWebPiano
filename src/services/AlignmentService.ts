import { EventEmitter } from 'utils/EventEmitter';
import { noteToMidiKeyNumber, parseNoteNameToNote } from 'utils/Note';
import { NoteSchedule } from 'utils/OSMD';

const MIDI_KEY_LENGTH = 128;
const PIANO_LENGTH = 88;

export type Similarity = {
  euclideanError: number;
  levenshteinError: number;
};

export enum AlignmentEvent {
  SIMILARITY_CHANGE = 'SIMILARITY_CHANGE',
}

export class AlignmentService {
  private readonly CALC_SIMILARITY_PERIOD = 500;

  public readonly sampleRate = 35;
  public readonly sampleStep = 1000 / this.sampleRate;
  public readonly sampleSec = 3;
  public readonly sampleLength = this.sampleRate * this.sampleSec;

  private userMIDIQueue: UserMIDICircularQueue;
  private scoreMIDI: ScoreMIDI;

  private sampleQueueTimer: any;
  private similarityTimer: any;

  private wasm: any = undefined;
  private similarity: Similarity | null = null;
  private events: EventEmitter<AlignmentEvent>;

  constructor() {
    this.userMIDIQueue = new UserMIDICircularQueue(this.sampleLength);
    this.scoreMIDI = new ScoreMIDI(this.sampleRate);
    this.events = new EventEmitter();

    this.sampleQueueTimer = setInterval(() => {
      this.userMIDIQueue.enqueueBinaryPressedKeySequence(
        this.currentBinaryPressedKeys,
      );
    }, this.sampleStep);

    this.similarityTimer = setInterval(() => {
      const userSequence = this._getUserMIDIKeyConcatenatedSequence();
      const scoreSequence = this._getScoreMIDIKeyConcatenatedSequence();
      this.similarity = this._calcScoreSimilarity(userSequence, scoreSequence);
      this._onSimilarityChange();
    }, this.CALC_SIMILARITY_PERIOD);
  }

  public get MeasureSamples() {
    return this.scoreMIDI.MeasureSamples;
  }

  private currentBinaryPressedKeys: Uint8Array = Uint8Array.from(
    { length: 88 },
    () => 0,
  );

  public async init() {
    const wasm = await import('midi-similarity-measurement');
    this.wasm = wasm;

    this.scoreMIDI.refresh();
  }

  public setBPM(bpm: number) {
    this.scoreMIDI.setBPM(bpm);
  }

  public setDenominator(denominator: number) {
    this.scoreMIDI.setDenominator(denominator);
  }

  public setLastMeasureInd(lastMeasureInd: number) {
    this.scoreMIDI.setLastMeasureInd(lastMeasureInd);
  }

  public setNoteScheduleSequence(noteScheduleSequence: NoteSchedule[]) {
    this.scoreMIDI.setNoteScheduleSequence(noteScheduleSequence);
  }

  public setBinaryPressedKeys(keys: Uint8Array) {
    if (keys.length !== 88) return;
    this.currentBinaryPressedKeys = keys;
  }

  public getUserBinaryMIDIKeyMatrix() {
    return this.userMIDIQueue.getBinaryMIDIKeyMatrix();
  }

  public getScoreBinaryMIDIKeyMatrix() {
    return this.scoreMIDI.getBinaryMIDIKeyMatrix();
  }

  public destroy() {
    clearInterval(this.sampleQueueTimer);
    clearInterval(this.similarityTimer);
  }

  public addSimilarityChangeListener(
    callback: (similarity: Similarity) => void,
  ) {
    this.events.on(AlignmentEvent.SIMILARITY_CHANGE, callback);
  }

  private _onSimilarityChange() {
    this.events.emit(AlignmentEvent.SIMILARITY_CHANGE, this.similarity);
  }

  private _calcScoreSimilarity(
    source1: Uint8Array,
    source2: Uint8Array,
  ): Similarity | null {
    if (this.wasm === undefined) {
      console.log('wasm is not loaded');
      return null;
    }

    const res = this.wasm?.score_similarity(source1, source2, false) as [
      number,
      number,
    ];

    return {
      euclideanError: res[0],
      levenshteinError: res[1],
    };
  }

  private _getUserMIDIKeyConcatenatedSequence(): Uint8Array {
    const sequenceList = this.userMIDIQueue.getMIDIKeySequenceList();
    return this._mapMIDIKeySequenceListToMIDIKeyConcatenatedSequence(
      sequenceList,
    );
  }

  private _getScoreMIDIKeyConcatenatedSequence(): Uint8Array {
    const sequenceList = this.scoreMIDI.getMIDIKeySequenceList();
    return this._mapMIDIKeySequenceListToMIDIKeyConcatenatedSequence(
      sequenceList ?? [],
    );
  }

  private _mapMIDIKeySequenceListToMIDIKeyConcatenatedSequence(
    midiKeySequenceList: number[][],
  ): Uint8Array {
    const length = midiKeySequenceList.reduce(
      (acc, midiKeySequence) => acc + midiKeySequence.length + 1,
      0,
    );
    const ret = Uint8Array.from({ length }, () => 0);

    let curpos = 0;
    for (const midiKeySequence of midiKeySequenceList) {
      ret[curpos] = midiKeySequence.length;
      curpos++;
      for (const event of midiKeySequence) {
        ret[curpos] = event;
        curpos++;
      }
    }
    return ret;
  }
}

class ScoreMIDI {
  private readonly RELEASE_CONSTANT = 0.8;

  private bpm: number = 120;
  private denominator: number = 4;
  private lastMeasureInd: number | null = null;
  private noteScheduleSequence: NoteSchedule[] | null = null;
  private sampleRate: number;

  private midiKeySequenceList: number[][] | null = null;
  private binaryMIDIKeyMatrix: Uint8Array | null = null;

  constructor(sampleRate: number) {
    this.sampleRate = sampleRate;
  }

  public getMIDIKeySequenceList(): number[][] | null {
    return this.midiKeySequenceList;
  }

  public getBinaryMIDIKeyMatrix(): Uint8Array | null {
    return this.binaryMIDIKeyMatrix;
  }

  public refresh() {
    this._calcMIDI();
  }

  public setBPM(bpm: number) {
    this.bpm = bpm;
    this._calcMIDI();
  }

  public setDenominator(denominator: number) {
    this.denominator = denominator;
    this._calcMIDI();
  }

  public setLastMeasureInd(ind: number) {
    this.lastMeasureInd = ind;
    this._calcMIDI();
  }

  public setNoteScheduleSequence(noteScheduleSequence: NoteSchedule[]) {
    this.noteScheduleSequence = noteScheduleSequence;
    this._calcMIDI();
  }

  public get MeasureSamples() {
    const realValueSec = (60 / this.bpm) * this.denominator;
    return Math.floor(realValueSec * this.sampleRate);
  }

  private _calcMIDI() {
    const filtered = this.noteScheduleSequence?.filter(
      (schedule) => schedule.measureInd === this.lastMeasureInd,
    );

    if (
      filtered === undefined ||
      filtered.length === 0 ||
      this.MeasureSamples === null
    ) {
      return;
    }

    const baseTime = filtered[0].timing;
    const midiKeySequenceList: number[][] = Array.from(
      {
        length: this.MeasureSamples,
      },
      () => [],
    );

    for (const schedule of filtered) {
      const time = schedule.timing - baseTime;
      const length = schedule.length * this.RELEASE_CONSTANT;

      const startFrame = Math.floor(time * this.MeasureSamples);
      const endFrame = startFrame + Math.floor(length * this.MeasureSamples);
      for (let i = startFrame; i < endFrame; i++) {
        midiKeySequenceList[i].push(noteToMidiKeyNumber(schedule.note));
      }
    }
    this.midiKeySequenceList = midiKeySequenceList;

    const binaryMIDIKeyMatrix = Uint8Array.from(
      {
        length: MIDI_KEY_LENGTH * this.MeasureSamples,
      },
      () => 0,
    );

    for (let i = 0; i < midiKeySequenceList.length; i++) {
      for (const midiKey of midiKeySequenceList[i]) {
        binaryMIDIKeyMatrix[MIDI_KEY_LENGTH * i + midiKey] = 1;
      }
    }

    this.binaryMIDIKeyMatrix = binaryMIDIKeyMatrix;
  }
}

class UserMIDICircularQueue {
  private length: number;
  private matrix: Uint8Array;
  private eventMatrix: number[][];
  private cursor: number;
  private offsetA0: number;
  constructor(length: number) {
    this.length = length;
    this.matrix = Uint8Array.from(
      { length: length * MIDI_KEY_LENGTH },
      () => 0,
    );
    this.eventMatrix = Array.from({ length }, () => []);
    this.cursor = 0;
    this.offsetA0 = noteToMidiKeyNumber(parseNoteNameToNote('A0'));
  }

  public enqueueBinaryPressedKeySequence(row: Uint8Array) {
    if (row.length !== PIANO_LENGTH) return;

    this.matrix.set(row, this.cursor * MIDI_KEY_LENGTH + this.offsetA0);
    this.eventMatrix[this.cursor] = [];
    const eventRow = this.eventMatrix[this.cursor];
    for (let i = 0; i < MIDI_KEY_LENGTH; i++) {
      if (row[i]) {
        eventRow.push(i + this.offsetA0);
      }
    }

    this.cursor++;
    if (this.cursor === this.length) {
      this.cursor = 0;
    }
  }

  public getBinaryMIDIKeyMatrix() {
    const ret = Uint8Array.from(
      { length: this.length * MIDI_KEY_LENGTH },
      () => 0,
    );
    const back = this.matrix.slice(this.cursor * MIDI_KEY_LENGTH);
    const front = this.matrix.slice(0, this.cursor * MIDI_KEY_LENGTH);
    ret.set(back);
    ret.set(front, back.length);
    return ret;
  }

  public getMIDIKeySequenceList() {
    const back = this.eventMatrix.slice(this.cursor);
    const front = this.eventMatrix.slice(0, this.cursor);
    return [...back, ...front];
  }
}

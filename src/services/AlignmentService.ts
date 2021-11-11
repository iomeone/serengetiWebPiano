import { EventEmitter } from 'utils/EventEmitter';
import { noteToMidiKeyNumber, parseNoteNameToNote } from 'utils/Note';
import { NoteSchedule, StaffLine } from 'utils/OSMD';

const MIDI_KEY_LENGTH = 128;
const PIANO_LENGTH = 88;

export type Similarity = {
  euclideanError: number;
  levenshteinError: number;
};

export enum AlignmentEvent {
  SIMILARITY_ARRAY_CHANGE = 'SIMILARITY_ARRAY_CHANGE',
  SCORE_CHANGE = 'SCORE_CHANGE',
}

export async function getSimilarity(): Promise<any> {
  return import('midi-similarity-measurement');
}

export class AlignmentService {
  private readonly CALC_SIMILARITY_PERIOD = 350;

  public readonly sampleRate = 20;
  public readonly onsetWeight = 10;
  public readonly settlingFrame = 5;

  public readonly sampleStep = 1000 / this.sampleRate;
  public readonly sampleSec = 3;
  public readonly sampleLength = this.sampleRate * this.sampleSec;

  private userMIDIQueue: UserMIDICircularQueue;
  private scoreMIDI: ScoreMIDI;

  private sampleQueueTimer: any;
  private similarityTimer: any;

  private wasm: any = undefined;
  private similarityArray: Similarity[] | null = null;
  private events: EventEmitter<AlignmentEvent>;

  constructor() {
    this.userMIDIQueue = new UserMIDICircularQueue(this.sampleLength);
    this.scoreMIDI = new ScoreMIDI(this.sampleRate);
    this.events = new EventEmitter();

    this.scoreMIDI.addChangeListener(() => {
      this.events.emit(AlignmentEvent.SCORE_CHANGE);
    });

    this.sampleQueueTimer = setInterval(() => {
      this.userMIDIQueue.enqueueBinaryPressedKeySequence(
        this.currentBinaryPressedKeys,
      );
    }, this.sampleStep);

    this.similarityTimer = setInterval(() => {
      const userMatrix = this.getUserBinaryMIDIKeyMatrix();
      const scoreMatrixArray = this.getScoreBinaryMIDIKeyMatrixArray();
      if (scoreMatrixArray === null) return;

      const newSimilarityArray = scoreMatrixArray.map((scoreMatrix) =>
        this._calcScoreSimilarity(scoreMatrix, userMatrix),
      );
      if (newSimilarityArray.find((s) => s === null) !== undefined) return;

      this.similarityArray = newSimilarityArray as Similarity[];
      this._onSimilarityArrayChange();
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
    const wasm = await getSimilarity();
    this.wasm = wasm;

    this.scoreMIDI.refresh();
  }

  public setBPM(bpm: number) {
    this.scoreMIDI.setBPM(bpm);
  }

  public setDenominator(denominator: number) {
    this.scoreMIDI.setDenominator(denominator);
  }

  public setNumerator(numerator: number) {
    this.scoreMIDI.setNumerator(numerator);
  }

  public setStaffLines(staffLines: StaffLine[]) {
    this.scoreMIDI.setStaffLines(staffLines);
  }

  public setLastStaffInd(lastStaffInd: number) {
    this.scoreMIDI.setLastStaffInd(lastStaffInd);
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

  public getScoreBinaryMIDIKeyMatrixArray() {
    return this.scoreMIDI.getBinaryMIDIKeyMatrixArray();
  }

  public getFirstMeasureInd() {
    return this.scoreMIDI.FirstMeasureInd;
  }

  public getLastMeasureInd() {
    return this.scoreMIDI.LastMeasureInd;
  }

  public getNumMeasures() {
    if (
      this.scoreMIDI.LastMeasureInd === null ||
      this.scoreMIDI.FirstMeasureInd === null
    )
      return 0;
    return this.scoreMIDI.LastMeasureInd - this.scoreMIDI.FirstMeasureInd + 1;
  }

  public destroy() {
    clearInterval(this.sampleQueueTimer);
    clearInterval(this.similarityTimer);
  }

  public addSimilarityArrayChangeListener(
    callback: (similarityArray: Similarity[]) => void,
  ) {
    this.events.on(AlignmentEvent.SIMILARITY_ARRAY_CHANGE, callback);
  }

  public addScoreChangeListener(callback: () => void) {
    this.events.on(AlignmentEvent.SCORE_CHANGE, callback);
  }

  private _onSimilarityArrayChange() {
    this.events.emit(
      AlignmentEvent.SIMILARITY_ARRAY_CHANGE,
      this.similarityArray,
    );
  }

  private _calcScoreSimilarity(
    matrix1: Uint8Array,
    matrix2: Uint8Array,
  ): Similarity | null {
    if (this.wasm === undefined) {
      console.log('wasm is not loaded');
      return null;
    }

    const res = this.wasm?.scoreSimilarity(
      matrix1,
      matrix2,
      this.onsetWeight,
      this.settlingFrame,
      false, //use distance_fn
      false, //debug
    ) as [number, number];

    return {
      euclideanError: res[0],
      levenshteinError: res[1],
    };
  }

  // private _getUserMIDIKeySerializedSequence(): Uint8Array {
  //   const sequenceList = this.userMIDIQueue.getMIDIKeySequenceList();
  //   return this._mapMIDIKeySequenceListToMIDIKeySerializedSequence(
  //     sequenceList,
  //   );
  // }

  // private _getScoreMIDIKeySerializedSequenceArray(): Uint8Array[] | null {
  //   const sequenceListArray = this.scoreMIDI.getMIDIKeySequenceListArray();
  //   return (
  //     sequenceListArray?.map((sequenceList) =>
  //       this._mapMIDIKeySequenceListToMIDIKeySerializedSequence(sequenceList),
  //     ) ?? null
  //   );
  // }

  // private _mapMIDIKeySequenceListToMIDIKeySerializedSequence(
  //   midiKeySequenceList: number[][],
  // ): Uint8Array {
  //   const length = midiKeySequenceList.reduce(
  //     (acc, midiKeySequence) => acc + midiKeySequence.length + 1,
  //     0,
  //   );
  //   const ret = Uint8Array.from({ length }, () => 0);

  //   let curpos = 0;
  //   for (const midiKeySequence of midiKeySequenceList) {
  //     ret[curpos] = midiKeySequence.length;
  //     curpos++;
  //     for (const event of midiKeySequence) {
  //       ret[curpos] = event;
  //       curpos++;
  //     }
  //   }
  //   return ret;
  // }
}

type MIDIKeySequenceList = number[][];

class ScoreMIDI {
  private readonly RELEASE_CONSTANT = 0.8;

  private bpm: number = 120;
  private denominator: number = 4;
  private numerator: number = 4;
  private lastStaffInd: number | null = null;
  private staffLines: StaffLine[] | null = null;
  private noteScheduleSequence: NoteSchedule[] | null = null;
  private sampleRate: number;

  private firstMeasureInd: number | null = null;
  private lastMeasureInd: number | null = null;
  private midiKeySequenceListArray: MIDIKeySequenceList[] | null = null;
  private binaryMIDIKeyMatrixArray: Uint8Array[] | null = null;

  private events: EventEmitter<AlignmentEvent>;

  constructor(sampleRate: number) {
    this.sampleRate = sampleRate;
    this.events = new EventEmitter();
  }

  public getMIDIKeySequenceListArray(): MIDIKeySequenceList[] | null {
    return this.midiKeySequenceListArray;
  }

  public getBinaryMIDIKeyMatrixArray(): Uint8Array[] | null {
    return this.binaryMIDIKeyMatrixArray;
  }

  public get FirstMeasureInd() {
    return this.firstMeasureInd;
  }

  public get LastMeasureInd() {
    return this.lastMeasureInd;
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

  public setNumerator(numerator: number) {
    this.numerator = numerator;
    this._calcMIDI();
  }

  public setLastStaffInd(ind: number) {
    this.lastStaffInd = ind;
    this._calcMIDI();
  }

  public setNoteScheduleSequence(noteScheduleSequence: NoteSchedule[]) {
    this.noteScheduleSequence = noteScheduleSequence;
    this._calcMIDI();
  }

  public setStaffLines(staffLines: StaffLine[]) {
    this.staffLines = staffLines;
    this._calcMIDI();
  }

  public get MeasureSamples() {
    const realValueSec = (60 / this.bpm) * this.numerator;
    return Math.floor(realValueSec * this.sampleRate);
  }

  public addChangeListener(callback: () => void) {
    this.events.on(AlignmentEvent.SCORE_CHANGE, callback);
  }

  private _calcMIDI() {
    if (
      this.lastStaffInd === null ||
      this.staffLines === null ||
      this.noteScheduleSequence === null
    )
      return;

    const lastStaff = this.staffLines[this.lastStaffInd];
    const noteSchedulesByMeasure: NoteSchedule[][] = [];
    let noteScheduleInd = 0;
    for (
      let measureInd = lastStaff.firstMeasureInd;
      measureInd <= lastStaff.lastMeasureInd;
      measureInd++
    ) {
      const noteSchedulesInMeasure = [];
      while (true) {
        const noteSchedule = this.noteScheduleSequence[noteScheduleInd];
        if (noteSchedule === undefined) break;

        if (noteSchedule.measureInd < measureInd) {
          noteScheduleInd++;
          continue;
        } else if (noteSchedule.measureInd === measureInd) {
          noteSchedulesInMeasure.push(noteSchedule);
          noteScheduleInd++;
        } else {
          break;
        }
      }
      noteSchedulesByMeasure.push(noteSchedulesInMeasure);
    }

    this.firstMeasureInd = lastStaff.firstMeasureInd;
    this.lastMeasureInd = lastStaff.lastMeasureInd;

    const newMidiKeySequenceListArray: MIDIKeySequenceList[] = [];
    const newBinaryMIDIKeyMatrixArray: Uint8Array[] = [];

    for (const filtered of noteSchedulesByMeasure) {
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
      newMidiKeySequenceListArray.push(midiKeySequenceList);

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

      newBinaryMIDIKeyMatrixArray.push(binaryMIDIKeyMatrix);
    }

    this.midiKeySequenceListArray = newMidiKeySequenceListArray;
    this.binaryMIDIKeyMatrixArray = newBinaryMIDIKeyMatrixArray;

    this._onScoreChange();
  }

  private _onScoreChange() {
    this.events.emit(AlignmentEvent.SCORE_CHANGE);
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

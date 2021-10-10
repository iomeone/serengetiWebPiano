import { noteToMidiKeyNumber, parseNoteNameToNote } from 'utils/Note';

export type Similarity = {
  euclideanError: number;
  levenshteinError: number;
};

export class AlignmentService {
  public readonly sampleRate = 35;
  public readonly sampleStep = 1000 / this.sampleRate;
  public readonly sampleSec = 3;

  public readonly sampleLength = this.sampleRate * this.sampleSec;
  private midiMatrixQueue: MIDIInfoCircularQueue;
  private timer: any;
  private wasm: any = undefined;

  constructor() {
    this.midiMatrixQueue = new MIDIInfoCircularQueue(this.sampleLength);

    this.timer = setInterval(() => {
      this.midiMatrixQueue.enqueueRow(this.currentBinaryPressedKeys);
    }, this.sampleStep);
  }

  private currentBinaryPressedKeys: Uint8Array = Uint8Array.from(
    { length: 88 },
    () => 0,
  );

  public async init() {
    const wasm = await import('midi-similarity-measurement');
    this.wasm = wasm;
  }

  public scoreSimilarity(
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

  public setBinaryPressedKeys(keys: Uint8Array) {
    if (keys.length !== 88) return;
    this.currentBinaryPressedKeys = keys;
  }

  public getMidiMatrix() {
    return this.midiMatrixQueue.getMIDIMatrix();
  }

  public getEventMatrix() {
    return this.midiMatrixQueue.getEventMatrix();
  }

  public getEventSequence(): Uint8Array {
    const matrix = this.midiMatrixQueue.getEventMatrix();
    return AlignmentService.EventMatrixToSequence(matrix);
  }

  public destroy() {
    clearInterval(this.timer);
  }

  public static EventMatrixToSequence(matrix: number[][]): Uint8Array {
    const length = matrix.reduce((acc, events) => acc + events.length + 1, 0);
    const ret = Uint8Array.from({ length }, () => 0);

    let curpos = 0;
    for (const events of matrix) {
      ret[curpos] = events.length;
      curpos++;
      for (const event of events) {
        ret[curpos] = event;
        curpos++;
      }
    }

    return ret;
  }
}

const ROW_LENGTH = 128;
const PIANO_LENGTH = 88;
class MIDIInfoCircularQueue {
  private length: number;
  private matrix: Uint8Array;
  private eventMatrix: number[][];
  private cursor: number;
  private offsetA0: number;
  constructor(length: number) {
    this.length = length;
    this.matrix = Uint8Array.from({ length: length * ROW_LENGTH }, () => 0);
    this.eventMatrix = Array.from({ length }, () => []);
    this.cursor = 0;
    this.offsetA0 = noteToMidiKeyNumber(parseNoteNameToNote('A0'));
  }

  public enqueueRow(row: Uint8Array) {
    if (row.length !== PIANO_LENGTH) return;

    this.matrix.set(row, this.cursor * ROW_LENGTH + this.offsetA0);
    this.eventMatrix[this.cursor] = [];
    const eventRow = this.eventMatrix[this.cursor];
    for (let i = 0; i < ROW_LENGTH; i++) {
      if (row[i]) {
        eventRow.push(i + this.offsetA0);
      }
    }

    this.cursor++;
    if (this.cursor === this.length) {
      this.cursor = 0;
    }
  }

  public getMIDIMatrix() {
    const ret = Uint8Array.from({ length: this.length * ROW_LENGTH }, () => 0);
    const back = this.matrix.slice(this.cursor * ROW_LENGTH);
    const front = this.matrix.slice(0, this.cursor * ROW_LENGTH);
    ret.set(back);
    ret.set(front, back.length);
    return ret;
  }

  public getEventMatrix() {
    const back = this.eventMatrix.slice(this.cursor);
    const front = this.eventMatrix.slice(0, this.cursor);
    return [...back, ...front];
  }
}

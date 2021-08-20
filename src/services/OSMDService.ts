import { Fraction, OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { midiKeyNumberToNote, Note } from 'utils/Note';

// 여기에서 export?
export type NoteSchedule = {
  note: Note;
  timing: number;
  length: number;
};

export class OSMDService {
  private osmd: OSMD;
  private _bpm: number = 120;
  private _signiture: Fraction;

  constructor(osmd: OSMD) {
    this.osmd = osmd;

    this.osmd.cursor.reset();
    const iterator = this.osmd.cursor.iterator;
    this._bpm = iterator.CurrentMeasure.TempoInBPM;
    this._signiture = iterator.CurrentMeasure.ActiveTimeSignature;
    console.log(this._signiture);
  }
  public setBPM(bpm: number) {
    this._bpm = bpm;
  }
  public setSigniture(signiture: Fraction) {
    this._signiture = signiture;
  }
  public getBpm(): number {
    return this._bpm;
  }

  public getSigniture(): Fraction {
    return this._signiture;
  }

  public getNoteSchedules(): NoteSchedule[] {
    const allNoteSchedules: NoteSchedule[] = [];
    this.osmd.cursor.reset();
    const iterator = this.osmd.cursor.iterator;

    while (!iterator.EndReached) {
      const voices = iterator.CurrentVoiceEntries;
      for (let i = 0; i < voices.length; i++) {
        const v = voices[i];
        const notes = v.Notes;
        for (let j = 0; j < notes.length; j++) {
          const note = notes[j];
          // make sure our note is not silent
          if (note !== null && note.halfTone !== 0) {
            const midiKeyNumber = note.halfTone + 12; // see issue #224

            const timing = iterator.currentTimeStamp.RealValue;
            const length = note.Length.RealValue;
            // const numBeats =
            //   iterator.CurrentMeasure.ActiveTimeSignature.Denominator;
            // const timing =
            //   (iterator.currentTimeStamp.RealValue * numBeats * 60) / this._bpm;
            // const length = (note.Length.RealValue * numBeats * 60) / this._bpm;

            allNoteSchedules.push({
              note: midiKeyNumberToNote(midiKeyNumber),
              timing,
              length,
            });
          }
        }
      }
      iterator.moveToNext();
    }

    return allNoteSchedules;
  }
}

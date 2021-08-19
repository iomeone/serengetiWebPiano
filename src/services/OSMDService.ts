import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { Fraction } from 'opensheetmusicdisplay';
import { midiKeyNumberToNote, Note } from 'utils/Note';

type NoteSchedule = {
  note: Note;
  timing: number;
  length: number;
};

export class OSMDService {
  private osmd: OSMD;
  private bpm: number = 120;

  constructor(osmd: OSMD) {
    this.osmd = osmd;
  }

  public getNoteSchedules(): NoteSchedule[] {
    const allNoteSchedules: NoteSchedule[] = [];
    this.osmd.cursor.reset();
    const iterator = this.osmd.cursor.iterator;

    while (!iterator.EndReached) {
      const voices = iterator.CurrentVoiceEntries;
      for (var i = 0; i < voices.length; i++) {
        const v = voices[i];
        const notes = v.Notes;
        for (var j = 0; j < notes.length; j++) {
          const note = notes[j];
          // make sure our note is not silent
          if (note !== null && note.halfTone !== 0) {
            const midiKeyNumber = note.halfTone + 12; // see issue #224
            const numBeats =
              iterator.CurrentMeasure.ActiveTimeSignature.Denominator;
            const timing =
              (iterator.currentTimeStamp.RealValue * numBeats * 60) / this.bpm;
            const length = (note.Length.RealValue * numBeats * 60) / this.bpm;
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

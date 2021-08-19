import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { Fraction } from 'opensheetmusicdisplay';
import { midiKeyNumberToNote, Note } from 'utils/Note';

type NoteSchedule = {
  notes: Note[];
  timing: number;
};

type MidiKeyNumberSchedule = {
  midiKeyNumbers: number[];
  timing: number;
  timeSignature: Fraction;
  length: Fraction;
  bpm: number;
};

export class OSMDService {
  private osmd: OSMD;
  private bpm: number = 120;

  constructor(osmd: OSMD) {
    this.osmd = osmd;
  }

  public getNoteSchedules(): NoteSchedule[] {
    const allNoteSchedules: MidiKeyNumberSchedule[] = [];
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
            const timing =
              (iterator.currentTimeStamp.RealValue * 4 * 60) / this.bpm;
            const bpm = iterator.CurrentBpm;
            const timeSignature = iterator.CurrentMeasure.ActiveTimeSignature;
            const length = note.Length;
            allNoteSchedules.push({
              midiKeyNumbers: [midiKeyNumber],
              timing,
              timeSignature,
              length,
              bpm,
            });
          }
        }
      }
      iterator.moveToNext();
    }

    return allNoteSchedules.map((note) => ({
      ...note,
      notes: note.midiKeyNumbers.map((midiKeyNumber) =>
        midiKeyNumberToNote(midiKeyNumber),
      ),
    }));
  }
}

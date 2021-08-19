import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { midiKeyNumberToNote, Note } from 'utils/Note';

type NoteSchedule = {
  notes: Note[];
  timing: number;
};

type MidiKeyNumberSchedule = {
  midiKeyNumbers: number[];
  timing: number;
};

export class OSMDService {
  private osmd: OSMD;
  private bpm: number = 120;

  constructor(osmd: OSMD) {
    this.osmd = osmd;
  }

  public getNoteSchedules(): NoteSchedule[] {
    if (this.osmd === null) throw Error('OSMD Service is not initialized.');

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
          if (note != null && note.halfTone != 0) {
            const midiKeyNumber = note.halfTone + 12; // see issue #224
            const timing =
              (iterator.currentTimeStamp.RealValue * 4 * 60) / this.bpm;
            const len = allNoteSchedules.length;
            const lastNoteSchedule = allNoteSchedules[len - 1];
            if (lastNoteSchedule.timing === timing) {
              lastNoteSchedule.midiKeyNumbers.push(midiKeyNumber);
            } else {
              allNoteSchedules.push({
                midiKeyNumbers: [midiKeyNumber],
                timing,
              });
            }
          }
        }
      }
      iterator.moveToNext();
    }

    return allNoteSchedules.map((note) => ({
      timing: note.timing,
      notes: note.midiKeyNumbers.map((midiKeyNumber) =>
        midiKeyNumberToNote(midiKeyNumber),
      ),
    }));
  }
}

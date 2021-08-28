import {
  GraphicalMeasure,
  OpenSheetMusicDisplay as OSMD,
} from 'opensheetmusicdisplay';
import { midiKeyNumberToNote, Note } from 'utils/Note';

const OSMD_UNIT = 10; // see Is it possible to center the music vertically and/or horizontally? -opensheetmusicdisplay issue #745;

export type NoteSchedule = {
  note: Note;
  timing: number;
  length: number;
};

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export function getTimeSignature(osmd: OSMD) {
  return osmd.cursor.iterator.CurrentMeasure.ActiveTimeSignature;
}

export function getBPM(osmd: OSMD) {
  return osmd.cursor.iterator.CurrentMeasure.TempoInBPM;
}

export function getNoteSchedules(osmd: OSMD): NoteSchedule[] {
  const allNoteSchedules: NoteSchedule[] = [];
  osmd.cursor.reset();
  const iterator = osmd.cursor.iterator;

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

function _filterMeasures(measureList: GraphicalMeasure[][]) {
  return measureList.filter((measures) => {
    const measure = measures.find((measure) => measure !== undefined);
    return measure !== undefined;
  });
}

export function getMeasureBoundingBoxes(osmd: OSMD): Rect[] {
  const filtered = _filterMeasures(osmd.GraphicSheet.MeasureList);
  return filtered.map((measures) =>
    measures.reduce(
      (acc, measure) => {
        const { x, y } = measure.PositionAndShape.AbsolutePosition;
        const { width } = measure.PositionAndShape.BoundingRectangle;
        const { height } =
          measure.ParentStaffLine.PositionAndShape.BoundingRectangle;
        let left = x;
        let right = x + width;
        let top = y;
        let bottom = y + height;

        const res = { left: 0, right: 0, top: 0, bottom: 0 };

        // acc와 rect의 모든 점을 포괄하는 가장 큰 직사각형 만들기
        res.left = Math.min(acc.left, left * OSMD_UNIT);
        res.right = Math.max(acc.right, right * OSMD_UNIT);
        res.top = Math.min(acc.top, top * OSMD_UNIT);
        res.bottom = Math.max(acc.bottom, bottom * OSMD_UNIT);
        return res;
      },
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
    ),
  );
}

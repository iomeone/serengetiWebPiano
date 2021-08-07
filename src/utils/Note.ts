export enum PitchClass {
  C,
  Cis,
  D,
  Dis,
  E,
  F,
  Fis,
  G,
  Gis,
  A,
  Ais,
  B,
}
export const KeyType = [0,1,0,1,0,0,1,0,1,0,1,0];

export const midiKeyNumberToKeyType = (midiKeyNumber: number): number => {
  return KeyType[midiKeyNumber%12];
};

const pitchClassArr = Object.entries(PitchClass).map((p) => p[1]) as string[];

export type Note = {
  pitchClass: PitchClass;
  octave: number;
};

export const midiKeyNumberToNote = (midiKeyNumber: number): Note => {
  let octave = Math.floor(midiKeyNumber / 12) - 1;
  let pitchClass = midiKeyNumber % 12;
  return { pitchClass, octave };
};

export const noteToMidiKeyNumber = (note: Note): number => {
  return (note.octave + 1) * 12 + note.pitchClass;
};

export const noteToNoteName = (note: Note): string => {
  return pitchClassArr[note.pitchClass] + note.octave;
};

export const noteToBetterNoteName = (note: Note): string => {
  const noteName = noteToNoteName(note);
  return noteName.replace('is', '#');
};

export const midiKeyNumberToBetterNoteName = (midiKeyNumber: number): string => {
  const note = midiKeyNumberToNote(midiKeyNumber);
  return noteToBetterNoteName(note);
};

export const parseNoteNameToNote = (noteName: string): Note => {
  const noteReg = /^([A-Za-z]+)([0-9]+)$/;
  const ret = noteReg.exec(noteName);
  if (ret === null || ret.length < 3) throw 'parse failed';

  const className = ret[1];
  const pitchClass = pitchClassArr.findIndex((str) => str === className);
  if (pitchClass === -1) throw 'parse failed';
  const octave = parseInt(ret[2]);
  if (isNaN(octave)) throw 'parse failed';

  return { pitchClass, octave };
};

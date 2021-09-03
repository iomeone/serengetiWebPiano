export enum PitchClass {
  C = 0,
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

const KeyType = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
export const midiKeyNumberToKeyType = (midiKeyNumber: number): number => {
  return KeyType[midiKeyNumber % 12];
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

export const midiKeyNumberToBetterNoteName = (
  midiKeyNumber: number,
): string => {
  const note = midiKeyNumberToNote(midiKeyNumber);
  return noteToBetterNoteName(note);
};

export const parseNoteNameToNote = (noteName: string): Note => {
  const noteReg = /^([A-Za-z]+)([0-9]+)$/;
  const ret = noteReg.exec(noteName);
  if (ret === null || ret.length < 3) throw new Error('parse failed');

  const className = ret[1];
  const pitchClass = pitchClassArr.findIndex((str) => str === className);
  if (pitchClass === -1) throw new Error('parse failed');
  const octave = parseInt(ret[2]);
  if (isNaN(octave)) throw new Error('parse failed');

  return { pitchClass, octave };
};

export function isDiatonicNote(note: Note): boolean {
  switch (note.pitchClass) {
    case PitchClass.Ais:
    case PitchClass.Cis:
    case PitchClass.Dis:
    case PitchClass.Fis:
    case PitchClass.Gis:
      return false;
    default:
      return true;
  }
}

export function noteToDiatonicNumber(note: Note): number {
  const pitchClassArr: { pitchClass: PitchClass; ind: number }[] = [
    {
      pitchClass: PitchClass.Cis,
      ind: 0,
    },
    { pitchClass: PitchClass.Dis, ind: 1 },
    { pitchClass: PitchClass.E, ind: 2 },
    { pitchClass: PitchClass.Fis, ind: 3 },
    { pitchClass: PitchClass.Gis, ind: 4 },
    { pitchClass: PitchClass.Ais, ind: 5 },
    { pitchClass: PitchClass.B, ind: 6 },
  ];
  for (const entry of pitchClassArr) {
    if (note.pitchClass <= entry.pitchClass) return entry.ind + note.octave * 7;
  }
  return -1;
}

export function diatonicNumberToNote(diatonicNumber: number): Note {
  const map = {
    0: PitchClass.C,
    1: PitchClass.D,
    2: PitchClass.E,
    3: PitchClass.F,
    4: PitchClass.G,
    5: PitchClass.A,
    6: PitchClass.B,
  };
  const diatonicClass = diatonicNumber % 7;
  const octave = Math.floor(diatonicNumber / 7);

  return {
    octave,
    pitchClass: map[diatonicClass as keyof typeof map],
  };
}

export const parseNoteNameToDiatonicNumber = (noteName: string): number => {
  const noteReg = /^([A-Za-z]+)([0-9]+)$/;
  const ret = noteReg.exec(noteName);
  if (ret === null || ret.length < 3) throw new Error('parse failed');

  const className = ret[1];
  const pitchClass = pitchClassArr.findIndex((str) => str === className);
  if (pitchClass === -1) throw new Error('parse failed');
  const octave = parseInt(ret[2]);
  if (isNaN(octave)) throw new Error('parse failed');

  return noteToDiatonicNumber({ pitchClass, octave });
};

export const diatonicNumberToNoteName = (diatonicNumber: number): string => {
  const note = diatonicNumberToNote(diatonicNumber);
  return pitchClassArr[note.pitchClass] + note.octave;
};

const noteA0 = parseNoteNameToNote('A0');
export const noteA0MidiKeyNumber = noteToMidiKeyNumber(noteA0);

export const noteArrayToBinaryKeys = (notes: Note[]):boolean[] =>{
  const binaryKeys = Array.from({length: 88}, () => false);
  notes.forEach((note:Note)=>{
    binaryKeys[noteToMidiKeyNumber(note) - noteA0MidiKeyNumber] = true;
  });
  return binaryKeys;
}
export const binaryKeysToNoteArray = (binaryKeys: boolean[]):Note[] => {
  const result:Note[] = [];
  binaryKeys.forEach((value,index)=>{
    if(value) result.push(midiKeyNumberToNote(index + noteA0MidiKeyNumber));
  })
  return result;
}
export const isEqualNoteArray = (a: Note[],b: Note[]) =>{
  const binaryKeys_A = noteArrayToBinaryKeys(a); 
  const binaryKeys_B = noteArrayToBinaryKeys(b);
  // A0 아래는 같은지 확인할 수 없음 
  binaryKeys_A.forEach((value,index)=>{
    if(value !== binaryKeys_B[index]){
      return false;
    }
  })
  return true;
}
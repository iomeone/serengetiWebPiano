import { Sheet } from 'models/Sheet';
import { Note } from 'utils/Note';

export type CounterState = {
  count: number;
};

export type SheetState = {
  sheet: Sheet | null;
  file: File | null;
  osmd: any | null;
};

export type PianoState = {
  visibility: boolean;
  min: Note;
  max: Note;
};

export type State = {
  counter: CounterState;
  sheet: SheetState;
  piano: PianoState;
};

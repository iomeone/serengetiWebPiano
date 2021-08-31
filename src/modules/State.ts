import { WidthMode } from 'constants/layout';
import { Sheet } from 'models/Sheet';
import { EditorWorksheet } from 'models/Worksheet';
import { IAudioContext } from 'standardized-audio-context';
import { Note } from 'utils/Note';

export type AudioState = {
  sheets: {
    [sheetKey: string]: Sheet;
  };
  audioContext: IAudioContext | null;
};

export type PianoState = {
  visibility: boolean;
  min: Note;
  max: Note;
};

export type LayoutState = {
  ready: boolean;
  width: number;
  widthMode: WidthMode;
};

export type EditorState = {
  title: string;
  worksheetHistory: EditorWorksheet[];
  currentInd: number | null;
  undoable: boolean;
  redoable: boolean;
};

export type State = {
  audio: AudioState;
  piano: PianoState;
  layout: LayoutState;
  editor: EditorState;
};

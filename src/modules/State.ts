import { WidthMode } from 'constants/layout';
import { KeyEvent, KeyMap } from 'models/KeyMap';
import { Sheet } from 'models/Sheet';
import { Worksheet } from 'models/Worksheet';
import { AudioServiceType, IAudioService } from 'services/IAudioService';
import { IAudioContext } from 'standardized-audio-context';
import { Note } from 'utils/Note';

export type AudioState = {
  sheets: {
    [sheetKey: string]: Sheet;
  };
  audioContext: IAudioContext | null;
  audioService: IAudioService | null;
  audioServiceType: AudioServiceType | null;
};

export type PianoState = {
  visibility: boolean;
  min: Note;
  max: Note;
  volume: number;
};

export type LayoutState = {
  ready: boolean;
  width: number;
  widthMode: WidthMode;
};

export type EditorState = {
  title: string;
  worksheetHistory: Worksheet[];
  currentInd: number | null;
  undoable: boolean;
  redoable: boolean;
};

export type KeyboardState = {
  keyMap: KeyMap;
  keyEvent: KeyEvent | null;
};

export type State = {
  audio: AudioState;
  piano: PianoState;
  layout: LayoutState;
  editor: EditorState;
  keyboard: KeyboardState;
};

import { WidthMode } from 'constants/layout';
import { State } from 'modules/State';
import { parseNoteNameToNote } from 'utils/Note';

const inistialState: State = {
  audio: {
    sheets: {},
    audioContext: null,
    audioService: null,
    audioServiceType: null,
  },
  piano: {
    visibility: false,
    min: parseNoteNameToNote('A0'),
    max: parseNoteNameToNote('C8'),
  },
  layout: {
    ready: false,
    width: 0,
    widthMode: WidthMode.Desktop,
  },
  editor: {
    title: '',
    currentInd: null,
    worksheetHistory: [[]],
    undoable: false,
    redoable: false,
  },
  keyboard: {
    keyMap: {},
    keyEvent: null,
  },
};

export default inistialState;

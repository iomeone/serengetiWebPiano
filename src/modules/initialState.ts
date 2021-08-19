import { State } from 'modules/State';
import { parseNoteNameToNote } from 'utils/Note';

const inistialState: State = {
  counter: {
    count: 0,
  },
  audio: {
    sheets: {},
    audioContext: null,
  },
  piano: {
    visibility: true,
    min: parseNoteNameToNote('A0'),
    max: parseNoteNameToNote('C8'),
  },
};

export default inistialState;

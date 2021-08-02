import { State } from 'modules/State';
import { parseNoteNameToNote } from 'utils/Note';

const inistialState: State = {
  counter: {
    count: 0,
  },
  sheet: {
    sheet: null,
    file: null,
    osmd: null,
  },
  piano: {
    visibility: false,
    min: parseNoteNameToNote('A0'),
    max: parseNoteNameToNote('C8'),
  },
};

export default inistialState;

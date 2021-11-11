import { WidthMode } from 'constants/layout';
import { MonitorMode } from 'models/SimilarityMonitor';
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
    volume: 1,
  },
  alignment: {
    similarityMonitorMode: MonitorMode.Transparent,
    sensitivity: 0.88,
    turningThreshold: 0.5,
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

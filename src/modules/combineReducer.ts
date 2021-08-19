import { combineReducers } from 'redux';
import { audioReducer } from 'modules/audio';
import { pianoReducer } from 'modules/piano';

export default combineReducers({
  audio: audioReducer,
  piano: pianoReducer,
});

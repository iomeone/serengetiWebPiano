import { combineReducers } from 'redux';
import { counterReducer } from 'modules/counter';
import { audioReducer } from 'modules/audio';
import { pianoReducer } from 'modules/piano';

export default combineReducers({
  counter: counterReducer,
  audio: audioReducer,
  piano: pianoReducer,
});

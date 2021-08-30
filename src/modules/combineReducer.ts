import { combineReducers } from 'redux';
import { audioReducer } from 'modules/audio';
import { pianoReducer } from 'modules/piano';
import { layoutReducer } from 'modules/layout';
import { editorReducer } from './editor';

export default combineReducers({
  audio: audioReducer,
  piano: pianoReducer,
  layout: layoutReducer,
  editor: editorReducer,
});

import { combineReducers } from 'redux';
import { counterReducer } from 'modules/counter';
import { sheetReducer } from 'modules/sheet';
import { pianoReducer } from 'modules/piano';

export default combineReducers({
  counter: counterReducer,
  sheet: sheetReducer,
  piano: pianoReducer,
});

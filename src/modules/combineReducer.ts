import { combineReducers } from "redux";
import { counterReducer } from "modules/counter";
import { sheetReducer } from "./sheet";

export default combineReducers({
  counter: counterReducer,
  sheet: sheetReducer,
});

import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { KeyboardState } from 'modules/State';
import inistialState from './initialState';

export const SET_KEY_DOWN = '@KEYBOARD/SET_KEY_DOWN';
export const setKeyDown = (key: string) =>
  action(SET_KEY_DOWN, { key, on: true });
type SetKeyDown = ActionType<typeof setKeyDown>;

export const SET_KEY_UP = '@KEYBOARD/SET_KEY_UP';
export const setKeyUp = (key: string) => action(SET_KEY_UP, { key, on: false });
type SetKeyUp = ActionType<typeof setKeyUp>;

export type KeyboardActions = SetKeyDown | SetKeyUp;

export const keyboardReducer = (
  state: KeyboardState = inistialState.keyboard,
  action: KeyboardActions,
): KeyboardState => {
  switch (action.type) {
    case SET_KEY_DOWN:
    case SET_KEY_UP: {
      const { payload } = action as SetKeyDown;
      return produce<KeyboardState>(state, (draft) => {
        draft.keyMap = {
          ...draft.keyMap,
          [payload.key]: payload.on,
        };
        draft.keyEvent = payload;
      });
    }
    default:
      return state;
  }
};

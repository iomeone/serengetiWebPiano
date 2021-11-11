import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { PianoState } from 'modules/State';
import inistialState from './initialState';
import { Note } from 'utils/Note';

export const SET_PIANO_VISIBILITY = '@PIANO/SET_PIANO_VISIBILITY';
export const setPianoVisibility = (visibility: boolean) =>
  action(SET_PIANO_VISIBILITY, { visibility });
export type SetPianoVisibility = ActionType<typeof setPianoVisibility>;

export const SET_PIANO_RANGE = '@PIANO/SET_PIANO_RANGE';
export const setPianoRange = (range: [Note, Note]) =>
  action(SET_PIANO_RANGE, { range });
export type SetPianoRange = ActionType<typeof setPianoRange>;

export const SET_VOLUME = '@PIANO/SET_VOLUME';
export const setVolume = (volume: number) => action(SET_VOLUME, { volume });
export type SetVolume = ActionType<typeof setVolume>;

export type PianoActions = SetPianoVisibility | SetPianoRange | SetVolume;

export const pianoReducer = (
  state: PianoState = inistialState.piano,
  action: PianoActions,
): PianoState => {
  switch (action.type) {
    case SET_PIANO_VISIBILITY: {
      const { payload } = action as SetPianoVisibility;
      return produce<PianoState>(state, (draft) => {
        draft.visibility = payload.visibility;
      });
    }
    case SET_PIANO_RANGE: {
      const { payload } = action as SetPianoRange;
      return produce<PianoState>(state, (draft) => {
        draft.min = payload.range[0];
        draft.max = payload.range[1];
      });
    }
    case SET_VOLUME: {
      const { payload } = action as SetVolume;
      return produce<PianoState>(state, (draft) => {
        draft.volume = payload.volume;
      });
    }
    default:
      return state;
  }
};

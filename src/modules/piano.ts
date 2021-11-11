import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { PianoState } from 'modules/State';
import inistialState from './initialState';
import { Note } from 'utils/Note';
import { MonitorMode } from 'models/SimilarityMonitor';

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

export const SET_SIMILARITY_MONITOR_MODE = '@PIANO/SET_SIMILARITY_MONITOR_MODE';
export const setSimilarityMonitorMode = (mode: MonitorMode) =>
  action(SET_SIMILARITY_MONITOR_MODE, { mode });
export type SetSimilarityMonitorMode = ActionType<
  typeof setSimilarityMonitorMode
>;

export const SET_SENSITIVITY = '@PIANO/SET_SENSITIVITY';
export const setSensitivity = (sensitivity: number) =>
  action(SET_SENSITIVITY, { sensitivity });
export type SetSensitivity = ActionType<typeof setSensitivity>;

export type PianoActions =
  | SetPianoVisibility
  | SetPianoRange
  | SetVolume
  | SetSimilarityMonitorMode
  | SetSensitivity;

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
    case SET_SIMILARITY_MONITOR_MODE: {
      const { payload } = action as SetSimilarityMonitorMode;
      return produce<PianoState>(state, (draft) => {
        draft.similarityMonitorMode = payload.mode;
      });
    }
    case SET_SENSITIVITY: {
      const { payload } = action as SetSensitivity;
      return produce<PianoState>(state, (draft) => {
        draft.sensitivity = payload.sensitivity;
      });
    }
    default:
      return state;
  }
};

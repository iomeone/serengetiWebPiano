import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { AudioState, State } from 'modules/State';
import inistialState from './initialState';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { IAudioContext } from 'standardized-audio-context';
import { Sheet } from 'models/Sheet';

export const ADD_SHEET = '@AUDIO/ADD_SHEET';
export const addSheet = (sheetKey: string, osmd: OSMD) =>
  action(ADD_SHEET, { sheetKey, osmd });
export type AddSheet = ActionType<typeof addSheet>;

export const SET_TITLE = '@AUDIO/SET_TITLE';
export const _setTitle = (sheetKey: string, title: string) =>
  action(SET_TITLE, { sheetKey, title });
export type SetTitle = ActionType<typeof _setTitle>;

export const SET_LOADED = '@AUDIO/SET_LOADED';
export const _setLoaded = (sheetKey: string, loaded: boolean) =>
  action(SET_LOADED, { sheetKey, loaded });
export type SetLoaded = ActionType<typeof _setLoaded>;

export const SET_AUDIO_CONTEXT = '@AUDIO/SET_AUDIO_CONTEXT';
export const setAudioContext = (audioContext: IAudioContext) =>
  action(SET_AUDIO_CONTEXT, { audioContext });
export type SetAudioContext = ActionType<typeof setAudioContext>;

export type AudioActions = AddSheet | SetTitle | SetLoaded | SetAudioContext;

/* thunks */

export const loadSheetThunk =
  (sheetKey: string, file: File) =>
  async (dispatch: Function, getState: () => State) => {
    const osmd = getState().audio.sheets[sheetKey].osmd;
    try {
      await osmd.load(await file.text());
    } catch {
      return;
    }
    osmd.render();
    dispatch(_setTitle(sheetKey, file.name));
    dispatch(_setLoaded(sheetKey, true));
  };

export const loadTestSheetThunk =
  (sheetKey: string) => async (dispatch: Function, getState: () => State) => {
    const osmd = getState().audio.sheets[sheetKey].osmd;
    try {
      await osmd.load(
        'https://opensheetmusicdisplay.github.io/demo/sheets/MuzioClementi_SonatinaOpus36No3_Part1.xml',
      );
    } catch {
      return;
    }
    osmd.render();
    dispatch(_setTitle(sheetKey, 'test data'));
    dispatch(_setLoaded(sheetKey, true));
  };

export const audioReducer = (
  state: AudioState = inistialState.audio,
  action: AudioActions,
): AudioState => {
  switch (action.type) {
    case ADD_SHEET: {
      const { payload } = action as AddSheet;
      return produce<AudioState>(state, (draft) => {
        const sheet: Sheet = {
          osmd: payload.osmd as any,
          title: null,
          loaded: false,
        };
        draft.sheets[payload.sheetKey] = sheet;
      });
    }
    case SET_TITLE: {
      const { payload } = action as SetTitle;
      return produce<AudioState>(state, (draft) => {
        const sheet = draft.sheets[payload.sheetKey] as Sheet;
        sheet.title = payload.title;
      });
    }
    case SET_LOADED: {
      const { payload } = action as SetLoaded;
      return produce<AudioState>(state, (draft) => {
        const sheet = draft.sheets[payload.sheetKey] as Sheet;
        sheet.loaded = payload.loaded;
      });
    }
    case SET_AUDIO_CONTEXT: {
      const { payload } = action as SetAudioContext;
      return produce<AudioState>(state, (draft) => {
        draft.audioContext = payload.audioContext;
      });
    }
    default:
      return state;
  }
};

import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { AudioState, State } from 'modules/State';
import inistialState from './initialState';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { IAudioContext } from 'standardized-audio-context';

export const ADD_SHEET = '@AUDIO/ADD_SHEET';
export const addSheet = (key: string, osmd: OSMD) =>
  action(ADD_SHEET, { key, osmd });
type AddSheet = ActionType<typeof addSheet>;

export const SET_FILE = '@AUDIO/SET_FILE';
export const _setFile = (key: string, file: File) =>
  action(SET_FILE, { key, file });
type SetFile = ActionType<typeof _setFile>;

export const SET_TITLE = '@AUDIO/SET_TITLE';
export const _setTitle = (key: string, title: string) =>
  action(SET_TITLE, { key, title });
type SetTitle = ActionType<typeof _setTitle>;

export const SET_LOADED = '@AUDIO/SET_LOADED';
export const _setLoaded = (key: string, loaded: boolean) =>
  action(SET_LOADED, { key, loaded });
type SetLoaded = ActionType<typeof _setLoaded>;

export const SET_AUDIO_CONTEXT = '@AUDIO/SET_AUDIO_CONTEXT';
export const setAudioContext = (audioContext: IAudioContext) =>
  action(SET_AUDIO_CONTEXT, { audioContext });
type SetAudioContext = ActionType<typeof setAudioContext>;

export type AudioActions =
  | AddSheet
  | SetFile
  | SetTitle
  | SetLoaded
  | SetAudioContext;

/* thunks */

export const loadSheetThunk =
  (key: string, file: File) =>
  async (dispatch: Function, getState: () => State) => {
    const osmd = getState().audio.sheets[key].osmd;
    try {
      await osmd.load(await file.text());
    } catch {
      return;
    }
    dispatch(_setTitle(key, file.name));
    dispatch(_setFile(key, file));
    dispatch(_setLoaded(key, true));
    osmd.render();
  };

export const loadTestSheetThunk =
  (key: string) => async (dispatch: Function, getState: () => State) => {
    const osmd = getState().audio.sheets[key].osmd;
    try {
      await osmd.load(
        'https://opensheetmusicdisplay.github.io/demo/sheets/MuzioClementi_SonatinaOpus36No3_Part1.xml',
      );
    } catch {
      return;
    }
    dispatch(_setTitle(key, 'test data'));
    dispatch(_setLoaded(key, true));
    osmd.render();
  };

export const audioReducer = (
  state: AudioState = inistialState.audio,
  action: AudioActions,
): AudioState => {
  switch (action.type) {
    case ADD_SHEET: {
      const { payload } = action as AddSheet;
      return produce<AudioState>(state, (draft) => {
        const sheet = {
          osmd: payload.osmd as any,
          file: null,
          title: null,
          loaded: false,
        };
        draft.sheets[payload.key] = sheet;
      });
    }
    case SET_FILE: {
      const { payload } = action as SetFile;
      return produce<AudioState>(state, (draft) => {
        draft.sheets[payload.key].file = payload.file;
      });
    }
    default:
      return state;
  }
};

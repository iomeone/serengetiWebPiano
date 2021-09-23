import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { AudioState, State } from 'modules/State';
import inistialState from './initialState';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { IAudioContext } from 'standardized-audio-context';
import { Sheet } from 'models/Sheet';
import {
  IPlaybackService,
  PlaybackServiceType,
  PlaybackState,
} from 'services/IPlaybackService';
import { AudioServiceType, IAudioService } from 'services/IAudioService';

export const ADD_SHEET = '@AUDIO/ADD_SHEET';
export const addSheet = (sheetKey: string, osmd: OSMD) =>
  action(ADD_SHEET, { sheetKey, osmd });
export type AddSheet = ActionType<typeof addSheet>;

export const DELETE_SHEET = '@AUDIO/DELETE_SHEET';
export const deleteSheet = (sheetKey: string) =>
  action(DELETE_SHEET, { sheetKey });
export type DeleteSheet = ActionType<typeof deleteSheet>;

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

export const SET_PLAYBACK_SERVICE = '@AUDIO/SET_PLAYBACK_SERVICE';
export const setPlaybackService = (
  sheetKey: string,
  playbackService: IPlaybackService | null,
  serviceType: PlaybackServiceType | null,
) => action(SET_PLAYBACK_SERVICE, { sheetKey, playbackService, serviceType });
export type SetPlaybackService = ActionType<typeof setPlaybackService>;

export const SET_PLAYBACK_STATE = '@AUDIO/SET_PLAYBACK_STATE';
export const setPlaybackState = (
  sheetKey: string,
  playbackState: PlaybackState | null,
) => action(SET_PLAYBACK_STATE, { sheetKey, playbackState });
export type SetPlaybackState = ActionType<typeof setPlaybackState>;

export const SET_METRONOME_STATE = '@AUDIO/SET_METRONOME_STATE';
export const setMetronomeState = (sheetKey: string, metronomeState: boolean) =>
  action(SET_METRONOME_STATE, { sheetKey, metronomeState });
export type SetMetronomeState = ActionType<typeof setMetronomeState>;

export const SET_CURRENT_MEASURE_IND = '@AUDIO/SET_CURRENT_MEASURE_IND';
export const setCurrentMeasureInd = (
  sheetKey: string,
  currentMeasureInd: number | null,
) => action(SET_CURRENT_MEASURE_IND, { sheetKey, currentMeasureInd });
export type SetCurrentMeasureInd = ActionType<typeof setCurrentMeasureInd>;

export const SET_AUDIO_SERVICE = '@AUDIO/SET_AUDIO_SERVICE';
export const setAudioService = (
  audioService: IAudioService | null,
  serviceType: AudioServiceType | null,
) => action(SET_AUDIO_SERVICE, { audioService, serviceType });
export type SetAudioService = ActionType<typeof setAudioService>;

export type AudioActions =
  | AddSheet
  | DeleteSheet
  | SetTitle
  | SetLoaded
  | SetAudioContext
  | SetPlaybackService
  | SetMetronomeState
  | SetPlaybackState
  | SetCurrentMeasureInd
  | SetAudioService;

/* thunks */

export const loadSheetWithUrlThunk =
  (sheetKey: string, title: string, url: string) =>
  async (dispatch: Function, getState: () => State) => {
    const sheet = getState().audio.sheets[sheetKey];
    const osmd = sheet.osmd;

    if (sheet.playbackService !== null) {
      sheet.playbackService.stop();
      if (sheet.metronomeState) sheet.playbackService.stopMetronome();
    }

    dispatch(_setTitle(sheetKey, 'loading...'));
    dispatch(_setLoaded(sheetKey, false));
    dispatch(setPlaybackService(sheetKey, null, null));

    try {
      await osmd.load(url);
    } catch {
      return;
    }
    osmd.render();

    dispatch(_setTitle(sheetKey, title));
    dispatch(_setLoaded(sheetKey, true));
  };

export const loadSheetThunk =
  (sheetKey: string, file: File) =>
  async (dispatch: Function, getState: () => State) => {
    dispatch(loadSheetWithUrlThunk(sheetKey, file.name, await file.text()));
  };

export const loadTestSheetThunk =
  (sheetKey: string) => async (dispatch: Function, getState: () => State) => {
    dispatch(
      loadSheetWithUrlThunk(
        sheetKey,
        'sonatina',
        'https://opensheetmusicdisplay.github.io/demo/sheets/MuzioClementi_SonatinaOpus36No3_Part1.xml',
      ),
    );
  };

export const cleanupSheetThunk =
  (sheetKey: string) => async (dispatch: Function, getState: () => State) => {
    const sheet = getState().audio.sheets[sheetKey];
    if (sheet === undefined) return;

    if (sheet.playbackService !== null) {
      sheet.playbackService.stop();
      sheet.playbackService.stopMetronome();
    }
    dispatch(deleteSheet(sheetKey));
  };

export const stopOtherPlaybackServicesThunk =
  (sheetKey: string) => async (dispatch: Function, getState: () => State) => {
    const sheets = getState().audio.sheets;
    const sheet = sheets[sheetKey];
    if (sheet === undefined) return;

    Object.entries(sheets).forEach(([key, sheet]) => {
      if (key !== sheetKey && sheet.playbackService !== null) {
        if (sheet.playbackState === PlaybackState.PLAYING) {
          sheet.playbackService.pause();
        }
        if (sheet.metronomeState) sheet.playbackService.stopMetronome();
      }
    });
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
          playbackService: null,
          playbackServiceType: null,
          currentMeasureInd: null,
          playbackState: null,
          metronomeState: false,
        };
        draft.sheets[payload.sheetKey] = sheet;
      });
    }
    case DELETE_SHEET: {
      const { payload } = action as DeleteSheet;
      return produce<AudioState>(state, (draft) => {
        delete draft.sheets[payload.sheetKey];
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
    case SET_PLAYBACK_SERVICE: {
      const { payload } = action as SetPlaybackService;
      return produce<AudioState>(state, (draft) => {
        draft.sheets[payload.sheetKey].playbackService =
          payload.playbackService;
        draft.sheets[payload.sheetKey].playbackServiceType =
          payload.serviceType;
      });
    }
    case SET_PLAYBACK_STATE: {
      const { payload } = action as SetPlaybackState;
      return produce<AudioState>(state, (draft) => {
        draft.sheets[payload.sheetKey].playbackState = payload.playbackState;
      });
    }
    case SET_METRONOME_STATE: {
      const { payload } = action as SetMetronomeState;
      return produce<AudioState>(state, (draft) => {
        draft.sheets[payload.sheetKey].metronomeState = payload.metronomeState;
      });
    }
    case SET_CURRENT_MEASURE_IND: {
      const { payload } = action as SetCurrentMeasureInd;
      return produce<AudioState>(state, (draft) => {
        draft.sheets[payload.sheetKey].currentMeasureInd =
          payload.currentMeasureInd;
      });
    }
    case SET_AUDIO_SERVICE: {
      const { payload } = action as SetAudioService;
      return produce<AudioState>(state, (draft) => {
        // should I manually close the previous audio service?
        draft.audioService = payload.audioService;
        draft.audioServiceType = payload.serviceType;
      });
    }
    default:
      return state;
  }
};

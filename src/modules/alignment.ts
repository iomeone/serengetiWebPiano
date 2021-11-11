import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { AlignmentState } from 'modules/State';
import inistialState from './initialState';
import { MonitorMode } from 'models/SimilarityMonitor';

export const SET_SIMILARITY_MONITOR_MODE =
  '@ALIGNMENT/SET_SIMILARITY_MONITOR_MODE';
export const setSimilarityMonitorMode = (mode: MonitorMode) =>
  action(SET_SIMILARITY_MONITOR_MODE, { mode });
export type SetSimilarityMonitorMode = ActionType<
  typeof setSimilarityMonitorMode
>;

export const SET_SENSITIVITY = '@ALIGNMENT/SET_SENSITIVITY';
export const setSensitivity = (sensitivity: number) =>
  action(SET_SENSITIVITY, { sensitivity });
export type SetSensitivity = ActionType<typeof setSensitivity>;

export const SET_TURNING_THRESHOLD = '@ALIGNMENT/SET_TURNING_THRESHOLD';
export const setTurningThreshold = (turningThreshold: number) =>
  action(SET_TURNING_THRESHOLD, { turningThreshold });
export type SetTurningThreshold = ActionType<typeof setTurningThreshold>;

export const SET_MONITOR_SCALE = '@ALIGNMENT/SET_MONITOR_SCALE';
export const setMonitorScale = (scale: number) =>
  action(SET_MONITOR_SCALE, { scale });
export type SetMonitorScale = ActionType<typeof setMonitorScale>;

export type AlignmentActions =
  | SetSimilarityMonitorMode
  | SetSensitivity
  | SetTurningThreshold
  | SetMonitorScale;

export const alignmentReducer = (
  state: AlignmentState = inistialState.alignment,
  action: AlignmentActions,
): AlignmentState => {
  switch (action.type) {
    case SET_SIMILARITY_MONITOR_MODE: {
      const { payload } = action as SetSimilarityMonitorMode;
      return produce<AlignmentState>(state, (draft) => {
        draft.similarityMonitorMode = payload.mode;
      });
    }
    case SET_SENSITIVITY: {
      const { payload } = action as SetSensitivity;
      return produce<AlignmentState>(state, (draft) => {
        draft.sensitivity = payload.sensitivity;
      });
    }
    case SET_TURNING_THRESHOLD: {
      const { payload } = action as SetTurningThreshold;
      return produce<AlignmentState>(state, (draft) => {
        draft.turningThreshold = payload.turningThreshold;
      });
    }
    case SET_MONITOR_SCALE: {
      const { payload } = action as SetMonitorScale;
      return produce<AlignmentState>(state, (draft) => {
        draft.monitorScale = payload.scale;
      });
    }
    default:
      return state;
  }
};

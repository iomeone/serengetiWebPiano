import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { LayoutState } from 'modules/State';
import inistialState from './initialState';
import { WidthMode } from 'constants/layout';

export const SET_WIDTH_MODE = '@LAYOUT/SET_WIDTH_MODE';
export const setWidthMode = (widthMode: WidthMode) =>
  action(SET_WIDTH_MODE, { widthMode });
type SetWidthMode = ActionType<typeof setWidthMode>;

export const SET_WIDTH = '@LAYOUT/SET_WIDTH';
export const setWidth = (width: number) => action(SET_WIDTH, { width });
type SetWidth = ActionType<typeof setWidth>;

export const SET_READY = '@LAYOUT/SET_READY';
export const setReady = (ready: boolean) => action(SET_READY, { ready });
type SetReady = ActionType<typeof setReady>;

export type LayoutActions = SetWidthMode | SetWidth | SetReady;

export const layoutReducer = (
  state: LayoutState = inistialState.layout,
  action: LayoutActions,
): LayoutState => {
  switch (action.type) {
    case SET_WIDTH_MODE: {
      const { payload } = action as SetWidthMode;
      return produce<LayoutState>(state, (draft) => {
        draft.widthMode = payload.widthMode;
      });
    }
    case SET_WIDTH: {
      const { payload } = action as SetWidth;
      return produce<LayoutState>(state, (draft) => {
        draft.width = payload.width;
      });
    }
    case SET_READY: {
      const { payload } = action as SetReady;
      return produce<LayoutState>(state, (draft) => {
        draft.ready = payload.ready;
      });
    }
    default:
      return state;
  }
};

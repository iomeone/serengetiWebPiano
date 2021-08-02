import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { SheetState, State } from 'modules/State';
import inistialState from './initialState';
import { Sheet } from 'models/Sheet';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';

export const SET_SHEET = '@SHEET/SET_SHEET';
export const SET_FILE = '@SHEET/SET_FILE';
export const SET_OSMD = '@SHEET/SET_OSMD';

export const setSheet = (sheet: Sheet) => action(SET_SHEET, { sheet });
type SetSheet = ActionType<typeof setSheet>;
export const setFile = (file: File) => action(SET_FILE, { file });
type SetFile = ActionType<typeof setFile>;
export const setOSMD = (osmd: OSMD) => action(SET_OSMD, { osmd });
type SetOSMD = ActionType<typeof setOSMD>;

export type SheetActions = SetSheet | SetFile | SetOSMD;

/* thunks */
export const loadSheetThunk =
  (file: File) =>
  async (dispatch: Function, getState: () => State): Promise<boolean> => {
    const osmd = getState().sheet.osmd as OSMD | null;
    if (osmd === null) return false;
    try {
      await osmd.load(await file.text());
    } catch {
      return false;
    }
    dispatch(
      setSheet({
        title: file.name,
      }),
    );
    dispatch(setFile(file));
    osmd.render();
    return true;
  };

export const sheetReducer = (
  state: SheetState = inistialState.sheet,
  action: SheetActions,
): SheetState => {
  switch (action.type) {
    case SET_SHEET: {
      const { payload } = action as SetSheet;
      return produce<SheetState>(state, (draft) => {
        draft.sheet = payload.sheet;
      });
    }
    case SET_FILE: {
      const { payload } = action as SetFile;
      return produce<SheetState>(state, (draft) => {
        draft.file = payload.file;
      });
    }
    case SET_OSMD: {
      const { payload } = action as SetOSMD;
      return produce<SheetState>(state, (draft) => {
        draft.osmd = payload.osmd;
      });
    }
    default:
      return state;
  }
};

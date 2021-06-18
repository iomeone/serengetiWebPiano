import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { SheetState, State } from 'modules/State';
import inistialState from './initialState';
import { Sheet } from 'models/Sheet';

export const SET_SHEET = '@SHEET/SET_SHEET';

export const setSheet = (sheet: Sheet) => action(SET_SHEET, { sheet });
type SetSheet = ActionType<typeof setSheet>;

export type CounterActions = SetSheet;

/* thunks */
export const loadSheetThunk =
  (file: File) =>
  async (dispatch: Function, getState: () => State): Promise<boolean> => {
    dispatch(
      setSheet({
        title: file.name,
      }),
    );
    return true;
  };

export const sheetReducer = (
  state: SheetState = inistialState.sheet,
  action: CounterActions,
): SheetState => {
  switch (action.type) {
    case SET_SHEET: {
      const { payload } = action as SetSheet;
      return produce<SheetState>(state, (draft) => {
        draft.sheet = payload.sheet;
      });
    }
    default:
      return state;
  }
};

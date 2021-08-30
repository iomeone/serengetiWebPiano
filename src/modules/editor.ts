import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { EditorState } from 'modules/State';
import inistialState from './initialState';
import { ContentType, WorksheetElem, Worksheet } from 'models/Worksheet';

export const ADD_WORKSHEET_ELEM = '@EDITOR/ADD_WORKSHEET_ELEM';
export const addWorksheetElem = (contentType: ContentType) =>
  action(ADD_WORKSHEET_ELEM, { contentType });
export type AddWorksheetElem = ActionType<typeof addWorksheetElem>;

export const UPDATE_WORKSHEET_ELEM = '@EDITOR/UPDATE_WORKSHEET_ELEM';
export const updateWorksheetElem = (elemInd: number, nextElem: WorksheetElem) =>
  action(UPDATE_WORKSHEET_ELEM, { elemInd, nextElem });
export type UpdateWorksheetElem = ActionType<typeof updateWorksheetElem>;

export const DELETE_WORKSHEET_ELEM = '@EDITOR/DELETE_WORKSHEET_ELEM';
export const deleteWorksheetElem = (elemInd: number) =>
  action(DELETE_WORKSHEET_ELEM, { elemInd });
export type DeleteWorksheetElem = ActionType<typeof deleteWorksheetElem>;

export const ARRANGE_WORKSHEET_ELEM = '@EDITOR/ARRANGE_WORKSHEET_ELEM';
export const arrangeWorksheetElem = (elemInd: number, destInd: number) =>
  action(ARRANGE_WORKSHEET_ELEM, { elemInd, destInd });
export type ArrangeWorksheetElem = ActionType<typeof arrangeWorksheetElem>;

export const UNDO = '@EDITOR/UNDO';
export const undo = () => action(UNDO, {});
export type Undo = ActionType<typeof undo>;

export const REDO = '@EDITOR/REDO';
export const redo = () => action(REDO, {});
export type Redo = ActionType<typeof redo>;

export type EditorActions =
  | AddWorksheetElem
  | UpdateWorksheetElem
  | DeleteWorksheetElem
  | ArrangeWorksheetElem
  | Undo
  | Redo;

export const editorReducer = (
  state: EditorState = inistialState.editor,
  action: EditorActions,
): EditorState => {
  switch (action.type) {
    case ADD_WORKSHEET_ELEM: {
      const { payload } = action as AddWorksheetElem;
      return undoAndRedoableChangeState(state, (currentState) => {
        const elem: WorksheetElem | null = makeElement(payload.contentType, 0);
        if (elem === null) throw new Error('Failed to make new element');
        if (currentState === null) {
          return [elem];
        } else {
          return [...currentState, elem];
        }
      });
    }
    case UPDATE_WORKSHEET_ELEM: {
      const { payload } = action as UpdateWorksheetElem;
      return undoAndRedoableChangeState(state, (currentState) => {
        if (currentState === null) return null;
        return produce(currentState, (draft) => {
          draft[payload.elemInd] = payload.nextElem;
        });
      });
    }
    case DELETE_WORKSHEET_ELEM: {
      const { payload } = action as DeleteWorksheetElem;
      return undoAndRedoableChangeState(state, (currentState) => {
        if (currentState === null) return null;
        return produce(currentState, (draft) => {
          draft.splice(payload.elemInd, 1);
        });
      });
    }
    case ARRANGE_WORKSHEET_ELEM: {
      const { payload } = action as ArrangeWorksheetElem;
      return undoAndRedoableChangeState(state, (currentState) => {
        if (currentState === null) return null;
        return produce(currentState, (draft) => {
          if (payload.destInd >= draft.length) return;
          const elem = draft[payload.elemInd] ?? null;
          if (elem === null) return;

          const res = [...draft];
          if (payload.elemInd < payload.destInd) {
            for (let i = payload.elemInd; i < payload.destInd; i++) {
              res[i] = res[i + 1];
            }
          } else {
            for (let i = payload.elemInd; i > payload.destInd; i--) {
              res[i] = res[i - 1];
            }
          }
          res[payload.destInd] = elem;
          draft = res;
        });
      });
    }
    case UNDO: {
      return produce(state, (draft) => {
        if (draft.undoable) {
          draft.currentInd = (draft.currentInd ?? 0) - 1;
          if (draft.currentInd === 0) draft.undoable = false;
          draft.redoable = true;
        }
      });
    }
    case REDO: {
      return produce(state, (draft) => {
        if (draft.redoable) {
          draft.currentInd = (draft.currentInd ?? 0) + 1;
          if (draft.currentInd === draft.worksheetHistory.length - 1)
            draft.redoable = false;
          draft.undoable = true;
        }
      });
    }
    default:
      return state;
  }
};

function makeElement(
  contentType: ContentType,
  elemNum: number,
): WorksheetElem | null {
  switch (contentType) {
    case ContentType.Paragraph:
      return {
        type: ContentType.Paragraph,
        content: [],
      };
    case ContentType.Sheet:
      return {
        type: ContentType.Sheet,
        key: '',
        oneStaff: false,
        path: '',
        title: `New Sheet ${elemNum}`,
      };
    case ContentType.Image:
      return {
        type: ContentType.Image,
        path: '',
        title: `New Image ${elemNum}`,
      };
    default:
      return null;
  }
}

function undoAndRedoableChangeState(
  state: EditorState,
  makeNextWorksheetState: (
    currentWorksheetState: Worksheet | null,
  ) => Worksheet | null,
) {
  return produce(state, (draft) => {
    const currentWorksheetState =
      draft.worksheetHistory[state.currentInd ?? 0] ?? null;

    const nextState = makeNextWorksheetState(currentWorksheetState);
    if (nextState === null) return;

    const nextInd = (draft.currentInd ?? 0) + 1;
    draft.currentInd = nextInd;
    if (nextInd <= draft.worksheetHistory.length) {
      draft.worksheetHistory = draft.worksheetHistory.slice(0, nextInd);
    }
    draft.worksheetHistory.push(nextState);
    draft.undoable = true;
    draft.redoable = false;
  });
}

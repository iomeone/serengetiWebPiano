import produce from 'immer';
import { action, ActionType } from 'typesafe-actions';
import { EditorState } from 'modules/State';
import inistialState from './initialState';
import { ContentType } from 'models/Worksheet';
import {
  EditorWorksheetElem,
  EditorWorksheet,
  StaffType,
} from 'models/EditorWorksheet';

export const LOAD_STATE = '@EDITOR/LOAD_STATE';
export const loadState = (editorState: EditorState) =>
  action(LOAD_STATE, { editorState });
export type LoadState = ActionType<typeof loadState>;

export const SET_TITLE = '@EDITOR/SET_TITLE';
export const setTitle = (title: string) => action(SET_TITLE, { title });
export type SetTitle = ActionType<typeof setTitle>;

export const ADD_WORKSHEET_ELEM = '@EDITOR/ADD_WORKSHEET_ELEM';
export const addWorksheetElem = (contentType: ContentType) =>
  action(ADD_WORKSHEET_ELEM, { contentType });
export type AddWorksheetElem = ActionType<typeof addWorksheetElem>;

export const UPDATE_WORKSHEET_ELEM = '@EDITOR/UPDATE_WORKSHEET_ELEM';
export const updateWorksheetElem = (
  elemInd: number,
  nextElem: EditorWorksheetElem,
) => action(UPDATE_WORKSHEET_ELEM, { elemInd, nextElem });
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
  | LoadState
  | SetTitle
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
    case LOAD_STATE: {
      const { payload } = action as LoadState;
      return payload.editorState;
    }
    case SET_TITLE: {
      const { payload } = action as SetTitle;
      return produce(state, (draft) => {
        draft.title = payload.title;
      });
    }
    case ADD_WORKSHEET_ELEM: {
      const { payload } = action as AddWorksheetElem;
      return undoAndRedoableChangeState(state, (currentState) => {
        const elem: EditorWorksheetElem | null = makeElement(
          payload.contentType,
          currentState?.length ?? 0,
        );
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

          if (payload.elemInd < payload.destInd) {
            for (let i = payload.elemInd; i < payload.destInd; i++) {
              draft[i] = draft[i + 1];
            }
          } else {
            for (let i = payload.elemInd; i > payload.destInd; i--) {
              draft[i] = draft[i - 1];
            }
          }
          draft[payload.destInd] = elem;
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
): EditorWorksheetElem | null {
  switch (contentType) {
    case ContentType.Paragraph:
      return {
        type: ContentType.Paragraph,
        content: [],
      };
    case ContentType.Sheet:
      return {
        type: ContentType.Sheet,
        title: `New Sheet ${elemNum}`,
        key: '',
        measureRange: [0, 0],
        musicxml: null,
        staffType: StaffType.BothHands,
      };
    case ContentType.Image:
      return {
        type: ContentType.Image,
        file: null,
        previewUrl: null,
        title: `New Image ${elemNum}`,
      };
    default:
      return null;
  }
}

function undoAndRedoableChangeState(
  state: EditorState,
  makeNextWorksheetState: (
    currentWorksheetState: EditorWorksheet | null,
  ) => EditorWorksheet | null,
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

import {
  ContentType,
  EditorWorksheet,
  EditorWorksheetElem,
} from 'models/Worksheet';
import {
  setTitle as setTitleActionCreator,
  addWorksheetElem,
  deleteWorksheetElem,
  updateWorksheetElem,
  redo as redoActionCreator,
  undo as undoActionCreator,
  arrangeWorksheetElem,
} from 'modules/editor';
import { State } from 'modules/State';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type UseEditorRes = {
  currentState: EditorWorksheet | null;
  redoable: boolean;
  undoable: boolean;
  title: string;
  setTitle: (nextTitle: string) => void;
  redo: () => void;
  undo: () => void;
  addElem: (contentType: ContentType) => void;
  updateElem: (elemInd: number, nextElem: EditorWorksheetElem) => void;
  deleteElem: (elemInd: number) => void;
  arrangeElem: (elemInd: number, destInd: number) => void;
};

export function useEditor(): UseEditorRes {
  const editor = useSelector((state: State) => state.editor);
  const currentState: EditorWorksheet | null = useMemo(
    () => editor.worksheetHistory[editor.currentInd ?? 0] ?? null,
    [editor.currentInd, editor.worksheetHistory],
  );

  const dispatch = useDispatch();
  const addElem = (contentType: ContentType) => {
    dispatch(addWorksheetElem(contentType));
  };
  const updateElem = (elemInd: number, nextElem: EditorWorksheetElem) => {
    dispatch(updateWorksheetElem(elemInd, nextElem));
  };
  const deleteElem = (elemInd: number) => {
    dispatch(deleteWorksheetElem(elemInd));
  };
  const undo = () => {
    dispatch(undoActionCreator());
  };
  const redo = () => {
    dispatch(redoActionCreator());
  };
  const arrangeElem = (elemInd: number, destInd: number) => {
    dispatch(arrangeWorksheetElem(elemInd, destInd));
  };
  const setTitle = (nextTitle: string) => {
    dispatch(setTitleActionCreator(nextTitle));
  };

  return {
    currentState,
    redoable: editor.redoable,
    undoable: editor.undoable,
    title: editor.title,
    setTitle,
    addElem,
    updateElem,
    deleteElem,
    arrangeElem,
    undo,
    redo,
  };
}

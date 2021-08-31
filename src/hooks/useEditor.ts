import { EditorJsonWorksheet } from 'models/EditorJsonWorksheet';
import { EditorWorksheet, EditorWorksheetElem } from 'models/EditorWorksheet';
import { ContentType } from 'models/Worksheet';
import {
  setTitle as setTitleActionCreator,
  loadState,
  addWorksheetElem,
  deleteWorksheetElem,
  updateWorksheetElem,
  redo as redoActionCreator,
  undo as undoActionCreator,
  arrangeWorksheetElem,
} from 'modules/editor';
import { EditorState, State } from 'modules/State';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editorToJson, jsonToEditor } from 'utils/Editor';

export enum LoadRes {
  Error = 'Error',
  Success = 'Success',
  NoData = 'NoData',
}

type UseEditorRes = {
  currentState: EditorWorksheet | null;
  redoable: boolean;
  undoable: boolean;
  title: string;
  loadEditor: () => LoadRes;
  saveEditor: () => Promise<boolean>;
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
  const loadEditor = () => {
    if (localStorage.getItem('saved') !== 'true') return LoadRes.NoData;

    const packStr = localStorage.getItem('editor');
    if (packStr === null) return LoadRes.Error;
    try {
      const pack = JSON.parse(packStr) as Pack;

      const worksheetHistory: EditorWorksheet[] = [];
      for (const worksheet of pack.worksheetHistory) {
        const editorWorksheet = jsonToEditor(worksheet);
        if (editorWorksheet === null) {
          console.log(worksheet);
          return LoadRes.Error;
        }
        worksheetHistory.push(editorWorksheet);
      }
      const nextEditor: EditorState = {
        ...pack,
        worksheetHistory,
      };
      dispatch(loadState(nextEditor));
    } catch (e) {
      console.log(e);
      return LoadRes.Error;
    }

    return LoadRes.Success;
  };
  const saveEditor = async () => {
    const jsonWorksheets: EditorJsonWorksheet[] = [];
    for (const worksheet of editor.worksheetHistory) {
      const jsonObj = await editorToJson(worksheet);
      if (jsonObj === null) return false;
      jsonWorksheets.push(jsonObj);
    }
    try {
      const pack: Pack = {
        ...editor,
        worksheetHistory: jsonWorksheets,
      };
      const packStr = JSON.stringify(pack);
      localStorage.setItem('editor', packStr);
    } catch (e) {
      console.log(e);
      return false;
    }
    localStorage.setItem('saved', 'true');
    return true;
  };
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
    loadEditor,
    saveEditor,
    setTitle,
    addElem,
    updateElem,
    deleteElem,
    arrangeElem,
    undo,
    redo,
  };
}

type Pack = {
  worksheetHistory: EditorJsonWorksheet[];
  title: string;
  currentInd: number | null;
  undoable: boolean;
  redoable: boolean;
};

import { UploadFile } from 'antd/lib/upload/interface';
import produce from 'immer';
import { Worksheet, WorksheetElem, Image, Sheet } from 'models/Worksheet';
import { ContentType } from 'models/Worksheet';
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
import { v4 as uuidv4 } from 'uuid';

export enum LoadRes {
  Error = 'Error',
  Success = 'Success',
  NoData = 'NoData',
}

type UseEditorRes = {
  currentState: Worksheet | null;
  redoable: boolean;
  undoable: boolean;
  title: string;
  loadEditor: () => LoadRes;
  saveEditor: () => Promise<boolean>;
  setTitle: (nextTitle: string) => void;
  redo: () => void;
  undo: () => void;
  addElem: (contentType: ContentType) => void;
  updateElem: (elemInd: number, nextElem: WorksheetElem) => void;
  deleteElem: (elemInd: number) => void;
  arrangeElem: (elemInd: number, destInd: number) => void;
  loadImageFile: (elem: Image, elemInd: number, file: UploadFile<any>) => void;
  loadMusicxmlFile: (
    elem: Sheet,
    elemInd: number,
    file: UploadFile<any>,
  ) => void;
};

export function useEditor(): UseEditorRes {
  const editor = useSelector((state: State) => state.editor);
  const currentState: Worksheet | null = useMemo(
    () => editor.worksheetHistory[editor.currentInd ?? 0] ?? null,
    [editor.currentInd, editor.worksheetHistory],
  );

  const dispatch = useDispatch();
  const loadEditor = () => {
    return LoadRes.Success;
  };
  const saveEditor = async () => {
    return true;
  };
  const addElem = (contentType: ContentType) => {
    dispatch(addWorksheetElem(contentType, uuidv4()));
  };
  const updateElem = (elemInd: number, nextElem: WorksheetElem) => {
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

  const loadImageFile = (
    elem: Image,
    elemInd: number,
    file: UploadFile<any>,
  ) => {
    const fileObj = file.originFileObj as File;
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.file = fileObj;
        draft.url = URL.createObjectURL(fileObj);
        draft.key = uuidv4();
      }),
    );
  };

  const loadMusicxmlFile = async (
    elem: Sheet,
    elemInd: number,
    file: UploadFile<any>,
  ) => {
    const fileObj = file.originFileObj as File;
    const text = await fileObj.text();

    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.musicxml = text;
        draft.key = uuidv4();
      }),
    );
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
    loadImageFile,
    loadMusicxmlFile,
  };
}

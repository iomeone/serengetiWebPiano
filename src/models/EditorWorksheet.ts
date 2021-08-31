import { Content, ContentType, Paragraph } from './Worksheet';

export type EditorParagraph = Paragraph;
export enum StaffType {
  RightHand = 'RightHand',
  LeftHand = 'LeftHand',
  BothHands = 'BothHands',
}
export type EditorSheet = Content<ContentType.Sheet> & {
  title: string;
  key: string;
  musicxml: string | null;
  staffType: StaffType;
  measureRange: [number, number];
};
export type EditorImage = Content<ContentType.Image> & {
  title: string;
  file: File | null;
  previewUrl: string | null;
};

export type EditorWorksheetElem = EditorParagraph | EditorSheet | EditorImage;
export type EditorWorksheet = EditorWorksheetElem[];

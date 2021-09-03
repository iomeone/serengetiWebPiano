import { EditorSheet } from './EditorWorksheet';
import { Content, ContentType, Paragraph } from './Worksheet';

export type EditorJsonParagraph = Paragraph;
export enum StaffType {
  RightHand = 'RightHand',
  LeftHand = 'LeftHand',
  BothHands = 'BothHands',
}
export type EditorJsonSheet = EditorSheet;
export type EditorJsonImage = Content<ContentType.Image> & {
  title: string;
  filename: string | null;
  encoded: string | null;
};

export type EditorJsonWorksheetElem =
  | EditorJsonParagraph
  | EditorJsonSheet
  | EditorJsonImage;
export type EditorJsonWorksheet = EditorJsonWorksheetElem[];

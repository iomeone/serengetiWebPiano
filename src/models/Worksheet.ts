export enum ContentType {
  Paragraph = 'Paragraph',
  Sheet = 'Sheet',
  Image = 'Image',
}

export type Content<T> = {
  type: T;
};

export type Paragraph = Content<ContentType.Paragraph> & {
  content: string[][];
};

export type Sheet = Content<ContentType.Sheet> & {
  key: string;
  title: string;
  path: string;
  oneStaff: boolean;
};

export type Image = Content<ContentType.Image> & {
  title: string;
  path: string;
};

export type WorksheetElem = Paragraph | Sheet | Image;
export type Worksheet = WorksheetElem[];

export type EditorParagraph = Paragraph;
export enum StaffType {
  RightHand = 'RightHand',
  LeftHand = 'LeftHand',
  BothHands = 'BothHands',
}
export type EditorSheet = Content<ContentType.Sheet> & {
  title: string;
  key: string;
  file: File | null;
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

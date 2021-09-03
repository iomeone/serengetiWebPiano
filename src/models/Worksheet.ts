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

export enum StaffType {
  RightHand = 'RightHand',
  LeftHand = 'LeftHand',
  BothHands = 'BothHands',
}

export type Sheet = Content<ContentType.Sheet> & {
  title: string;
  key: string;
  musicxml: string | null;
  staffType: StaffType;
};

export type Image = Content<ContentType.Image> & {
  title: string;
  key: string;
  file: File | null;
  url: string | null;
};

export type WorksheetElem = Paragraph | Sheet | Image;
export type Worksheet = WorksheetElem[];

export type WorksheetInfo = {
  title: string;
  worksheet: Worksheet;
};

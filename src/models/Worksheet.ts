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

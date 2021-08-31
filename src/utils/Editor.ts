import {
  ContentType,
  Image,
  Paragraph,
  Sheet,
  Worksheet,
  WorksheetElem,
} from 'models/Worksheet';
import JsZip from 'jszip';
import FileSaver from 'file-saver';
import { message } from 'antd';
import {
  EditorImage,
  EditorParagraph,
  EditorSheet,
  EditorWorksheet,
  StaffType,
} from 'models/EditorWorksheet';
import {
  EditorJsonImage,
  EditorJsonParagraph,
  EditorJsonSheet,
  EditorJsonWorksheet,
} from 'models/EditorJsonWorksheet';

type DownloadInfo = {
  filename: string;
  blob: Blob;
};

const exportZip = (title: string, infoList: DownloadInfo[]) => {
  const zip = JsZip();
  infoList.forEach((info) => {
    zip.file(info.filename, info.blob);
  });
  zip.generateAsync({ type: 'blob' }).then((zipFile) => {
    const fileName = `${title}.zip`;
    return FileSaver.saveAs(zipFile, fileName);
  });
};

export function downloadAsWorksheetFiles(
  title: string,
  editorWorksheet: EditorWorksheet,
) {
  const downloadInfoList: DownloadInfo[] = [];
  const worksheet = makeWorksheet(editorWorksheet);
  if (worksheet === null) {
    message.error('Worksheet 생성 실패');
  }
  const jsonStr = JSON.stringify(worksheet);
  const data = new Blob([jsonStr]);
  downloadInfoList.push({
    filename: 'data.json',
    blob: data,
  });

  editorWorksheet.forEach((elem) => {
    switch (elem.type) {
      case ContentType.Paragraph:
        break;
      case ContentType.Image:
        if (elem.file !== null) {
          const filename = makeFilename(elem.title, elem.file);
          downloadInfoList.push({
            filename,
            blob: elem.file,
          });
        }
        break;
      case ContentType.Sheet:
        if (elem.musicxml !== null) {
          const blob = new Blob([elem.musicxml]);
          const filename = `${elem.key}.musicxml`;
          downloadInfoList.push({
            filename,
            blob: blob,
          });
        }
    }
  });
  exportZip(title, downloadInfoList);
}

function makeFilename(title: string, file: File) {
  return `${title}.${getFileExtension(file)}`;
}

function getFileExtension(file: File) {
  return file.name.split('.').pop();
}

function makeWorksheet(editorWorksheet: EditorWorksheet): Worksheet | null {
  const res: WorksheetElem[] = [];

  for (const editorElem of editorWorksheet) {
    switch (editorElem.type) {
      case ContentType.Paragraph:
        res.push(editorElem as Paragraph);
        break;
      case ContentType.Image:
        if (editorElem.file === null) {
          return null;
        }
        res.push({
          type: ContentType.Image,
          path: makeFilename(editorElem.title, editorElem.file),
          title: editorElem.title,
        } as Image);
        break;
      case ContentType.Sheet:
        if (editorElem.musicxml === null) {
          return null;
        }
        res.push({
          type: ContentType.Sheet,
          title: editorElem.title,
          key: editorElem.key,
          oneStaff: editorElem.staffType !== StaffType.BothHands,
          path: `${editorElem.key}.musicxml`,
        } as Sheet);
        break;
    }
  }
  return res;
}

export function editorToJson(
  editorWorksheet: EditorWorksheet,
): EditorJsonWorksheet | null {
  return editorWorksheet.map((editorElem) => {
    switch (editorElem.type) {
      case ContentType.Paragraph:
        return editorElem as EditorJsonParagraph;
      case ContentType.Image:
        if (editorElem.file === null) {
          return {
            title: editorElem.title,
            type: ContentType.Image,
            encoded: null,
            filename: null,
          } as EditorJsonImage;
        } else {
          return {
            title: editorElem.title,
            type: ContentType.Image,
            filename: editorElem.file?.name ?? null,
            encoded: encodeImageFile(editorElem.file),
          } as EditorJsonImage;
        }
      case ContentType.Sheet:
        return editorElem as EditorJsonSheet;
    }
  });
}

export function jsonToEditor(
  jsonWorksheet: EditorJsonWorksheet,
): EditorWorksheet | null {
  return jsonWorksheet.map((jsonElem) => {
    switch (jsonElem.type) {
      case ContentType.Paragraph:
        return jsonElem as EditorParagraph;
      case ContentType.Image:
        if (jsonElem.encoded === null) {
          return {
            type: ContentType.Image,
            title: jsonElem.title,
            file: null,
            previewUrl: null,
          } as EditorImage;
        } else {
          const file = makeImageFile(
            jsonElem.filename as string,
            jsonElem.encoded,
          );
          return {
            type: ContentType.Image,
            title: jsonElem.title,
            file: file,
            previewUrl: URL.createObjectURL(file),
          } as EditorImage;
        }
      case ContentType.Sheet:
        return jsonElem as EditorSheet;
    }
  });
}

// TODO: 함수 구현하기
function makeImageFile(filename: string, encoded: string): File {
  return new File(['decoded'], filename);
}

// TODO: 함수 구현하기
function encodeImageFile(file: File): string {
  return 'encoded';
}

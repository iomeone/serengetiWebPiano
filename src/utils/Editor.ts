import {
  ContentType,
  EditorWorksheet,
  Image,
  Paragraph,
  Sheet,
  StaffType,
  Worksheet,
  WorksheetElem,
} from 'models/Worksheet';
import JsZip from 'jszip';
import FileSaver from 'file-saver';
import { message } from 'antd';

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
        if (elem.file !== null) {
          const filename = makeFilename(elem.key, elem.file);
          downloadInfoList.push({
            filename,
            blob: elem.file,
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
        if (editorElem.file === null) {
          return null;
        }
        res.push({
          type: ContentType.Sheet,
          title: editorElem.title,
          key: editorElem.key,
          oneStaff: editorElem.staffType !== StaffType.BothHands,
          path: makeFilename(editorElem.key, editorElem.file),
        } as Sheet);
        break;
    }
  }
  return res;
}

import { ContentType, EditorWorksheet } from 'models/Worksheet';
import JsZip from 'jszip';
import FileSaver from 'file-saver';

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
  editorWorksheet.forEach((elem) => {
    switch (elem.type) {
      case ContentType.Paragraph:
        break;
      case ContentType.Image:
        if (elem.file !== null) {
          downloadInfoList.push({
            filename: elem.title,
            blob: elem.file,
          });
        }
        break;
    }
  });
  exportZip(title, downloadInfoList);
}

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
type EncodedImageInfo = {
  filename: string;
  encoded: string;
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

export async function editorToJson(
  editorWorksheet: EditorWorksheet,
): Promise<EditorJsonWorksheet> {
  const res: EditorJsonWorksheet = [];

  for (const editorElem of editorWorksheet) {
    switch (editorElem.type) {
      case ContentType.Paragraph:
        res.push(editorElem as EditorJsonParagraph);
        break;
      case ContentType.Image:
        if (editorElem.file === null) {
          res.push({
            title: editorElem.title,
            type: ContentType.Image,
            encoded: null,
            filename: null,
          } as EditorJsonImage);
        } else {
          const info = await encodeImageFile(editorElem.file);
          res.push({
            title: editorElem.title,
            type: ContentType.Image,
            filename: info.filename,
            encoded: info.encoded,
          } as EditorJsonImage);
        }
        break;
      case ContentType.Sheet:
        res.push(editorElem as EditorJsonSheet);
        break;
    }
  }
  return res;
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
      default:
        throw Error('invalid content type');
    }
  });
}

async function encodeImageFile(file: File): Promise<EncodedImageInfo> {
  throw Error('not implemented');
  // const arrayBuffer = await file.arrayBuffer();
  // const base64String = btoa(
  //   String.fromCharCode(...new Uint8Array(arrayBuffer)),
  // );
  // return {
  //   encoded: base64String,
  //   filename: file.name,
  // };
}

function makeImageFile(filename: string, encoded: string): File {
  throw Error('not implemented');
  // const binary = atob(encoded);
  // let n = binary.length;
  // const u8arr = new Uint8Array(n);
  // while (n--) {
  //   u8arr[n] = binary.charCodeAt(n);
  // }
  // return new File([u8arr], filename);
}

const STAFF_RIGHT_HAND = '1';
const STAFF_LEFT_HAND = '2';

export function getScoreXml(xmlDocument: XMLDocument): Element | null {
  // musicxml parser code from opensheetmusicdisplay
  try {
    const xmlDocumentNodes: NodeList = xmlDocument.childNodes;

    let scorePartwiseElement: Element | null = null;
    for (
      let i: number = 0, length: number = xmlDocumentNodes.length;
      i < length;
      i += 1
    ) {
      const node: Node = xmlDocumentNodes[i];
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.nodeName.toLowerCase() === 'score-partwise'
      ) {
        scorePartwiseElement = node as Element;
        break;
      }
    }

    if (scorePartwiseElement === null) {
      throw Error('cannot find score-partwise in the musicxml file');
    }

    return scorePartwiseElement;
  } catch (e) {
    console.log('musicxml parse error: ', e);
    return null;
  }
}

export function hasMultipleStaves(score: Element): boolean {
  const parts = score.getElementsByTagName('part');
  if (!parts) throw Error('cannot find parts in the musicxml file');

  const firstPart = parts[0];
  const firstMeasure = firstPart.getElementsByTagName('measure')[0];
  const attributes = firstMeasure.getElementsByTagName('attributes')[0];
  const staves = attributes.getElementsByTagName('staves')[0];
  if (!staves) return false;

  try {
    const stavesNumber = parseInt(staves.innerHTML);
    if (stavesNumber === 1) return false;
  } catch (e) {
    console.log(e);
  }

  return true;
}

export function processMusicxml(
  musicxml: string,
  staffType: StaffType,
): string | null {
  const xmlDocument = getXmlDocument(musicxml);
  const score = getScoreXml(xmlDocument);
  if (score === null) return null;

  const multipleStaves = hasMultipleStaves(score);

  if (multipleStaves) {
    const parts = score.getElementsByTagName('part');
    if (!parts) throw Error('logic error');

    const firstPart = parts[0];
    const firstMeasure = firstPart.getElementsByTagName('measure')[0];
    const attributes = firstMeasure.getElementsByTagName('attributes')[0];
    const clefs = attributes.getElementsByTagName('clef');
    const staves = attributes.getElementsByTagName('staves')[0];
    if (staves) {
      switch (staffType) {
        case StaffType.BothHands: {
          staves.innerHTML = '2';
          const len = clefs.length;
          if (len > 2) {
            for (let i = 2; i < len; i++) {
              attributes.removeChild(clefs[i]);
            }
          }
          break;
        }
        case StaffType.RightHand: {
          attributes.removeChild(staves);
          attributes.removeChild(clefs[1]);
          break;
        }

        case StaffType.LeftHand: {
          attributes.removeChild(staves);
          attributes.removeChild(clefs[0]);
          break;
        }
      }
    }

    for (const part of parts) {
      const measures = part.getElementsByTagName('measure');
      for (const measure of measures) {
        const deleteNoteList = [];
        const notes = measure.getElementsByTagName('note');
        for (const note of notes) {
          let needDelete = false;
          const staff = note.getElementsByTagName('staff')[0];
          if (staff) {
            switch (staff.innerHTML) {
              case STAFF_RIGHT_HAND:
                if (staffType === StaffType.LeftHand) needDelete = true;
                break;
              case STAFF_LEFT_HAND:
                if (staffType === StaffType.RightHand) needDelete = true;
                break;
              default:
                needDelete = true;
            }
          } else {
            throw Error('logic error');
          }

          if (needDelete) {
            deleteNoteList.push(note);
          }
        }
        for (const note of deleteNoteList) {
          (measure as Element).removeChild(note);
        }
      }
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDocument);
  }

  return musicxml;
}

export function getXmlDocument(musicxml: string): XMLDocument {
  const parser: DOMParser = new DOMParser();
  return parser.parseFromString(musicxml, 'application/xml');
}

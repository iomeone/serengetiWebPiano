import { ContentType, StaffType, Worksheet } from 'models/Worksheet';

export function getFileExtension(file: File) {
  return file.name.split('.').pop();
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

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore/lite';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { WorksheetElem } from 'models/Worksheet';
import { ContentType, Worksheet } from 'models/Worksheet';
import { EditorState } from 'modules/State';
import { processMusicxml } from './Editor';
import { v4 as uuidv4 } from 'uuid';

const app = initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export type WorksheetInfo = {
  id: string;
  title: string;
};
export async function getWorksheets(): Promise<WorksheetInfo[] | null> {
  try {
    const worksheetsCol = collection(db, 'worksheets');
    const worksheetSnap = await getDocs(worksheetsCol);
    return worksheetSnap.docs.map((doc) => ({
      id: doc.id,
      title: doc.get('title') as string,
    }));
  } catch (e) {
    console.log(e);
  }
  return null;
}

export type WorksheetDetail = {
  title: string;
  worksheet: Worksheet;
};
export async function getWorksheetDetail(
  id: string,
): Promise<WorksheetDetail | null> {
  try {
    const docRef = doc(db, 'worksheets', id);
    const docSnap = await getDoc(docRef);
    const worksheet = docSnap.data() as {
      title: string;
      data: string;
    };

    const firebaseData = JSON.parse(worksheet.data) as Worksheet;
    const data = await firestoreWorksheetToWorksheet(firebaseData, true);
    if (data === null) return null;

    return {
      title: worksheet.title,
      worksheet: data,
    };
  } catch (e) {
    console.log(e);
  }
  return null;
}

async function checkKey(type: string, key: string): Promise<boolean> {
  try {
    const keyRef = ref(storage, `${type}/${key}`);
    await getDownloadURL(keyRef);
  } catch (e) {
    return false;
  }
  return true;
}
async function uploadFile(
  type: string,
  key: string,
  file: File,
): Promise<boolean> {
  if (!checkKey(type, key)) return false;

  try {
    const keyRef = ref(storage, `${type}/${key}`);
    await uploadBytes(keyRef, file);
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
}
async function uploadStr(
  type: string,
  key: string,
  str: string,
): Promise<boolean> {
  if (!checkKey(type, key)) return false;

  try {
    const keyRef = ref(storage, `${type}/${key}`);
    await uploadString(keyRef, str);
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
}
async function getFile(type: string, id: string): Promise<File | null> {
  try {
    const keyRef = ref(storage, `${type}/${id}`);
    const downloadUrl = await getDownloadURL(keyRef);
    const res = await fetch(downloadUrl);
    const file = new File([await res.blob()], id);
    return file;
  } catch (e) {
    console.log(e);
    return null;
  }
}
export const uploadImageFile = async (key: string, file: File) =>
  uploadFile('images', key, file);
export const uploadMusicxmlFile = async (key: string, str: string) =>
  uploadStr('sheets', key, str);
export const getImageFile = async (id: string) => getFile('images', id);
export const getMusicxmlFile = async (id: string) => getFile('sheets', id);

export async function firestoreWorksheetToWorksheet(
  firestoreWorksheet: Worksheet,
  isWorksheet: boolean = false,
): Promise<Worksheet> {
  const res = [];
  for (const elem of firestoreWorksheet) {
    switch (elem.type) {
      case ContentType.Paragraph:
        res.push(elem);
        break;
      case ContentType.Image: {
        const file = await getImageFile(elem.key);
        if (file === null) {
          res.push({ ...elem, file: null, url: null });
        } else {
          res.push({ ...elem, file, url: URL.createObjectURL(file) });
        }
        break;
      }
      case ContentType.Sheet: {
        if (isWorksheet) {
          const keyRef = ref(storage, `sheets/${elem.key}`);
          const downloadUrl = await getDownloadURL(keyRef);
          res.push({ ...elem, musicxml: downloadUrl });
        } else {
          const file = await getMusicxmlFile(elem.key);
          if (file === null) {
            res.push({ ...elem, musicxml: null });
          } else {
            res.push({
              ...elem,
              musicxml: await file.text(),
            });
          }
        }

        break;
      }
    }
  }
  return res;
}
export async function worksheetToFirestoreWorksheet(
  worksheet: Worksheet,
): Promise<Worksheet> {
  const res = [];
  for (const elem of worksheet) {
    switch (elem.type) {
      case ContentType.Paragraph:
        res.push(elem);
        break;
      case ContentType.Image: {
        if (elem.file !== null) {
          await uploadImageFile(elem.key, elem.file);
        }
        res.push({ ...elem, file: null, url: null });
        break;
      }
      case ContentType.Sheet: {
        if (elem.musicxml !== null) {
          await uploadMusicxmlFile(elem.key, elem.musicxml);
        }
        res.push({ ...elem, musicxml: null });
        break;
      }
    }
  }
  return res;
}

export async function draftToPublishWorksheet(
  draft: Worksheet,
): Promise<Worksheet | null> {
  const res: WorksheetElem[] = [];
  for (const elem of draft) {
    switch (elem.type) {
      case ContentType.Paragraph:
      case ContentType.Image:
        res.push(elem);
        break;
      case ContentType.Sheet:
        if (elem.musicxml === null) {
          return null;
        }

        const nextElem = { ...elem };
        nextElem.key = uuidv4();
        nextElem.musicxml = null;
        const musicxml = processMusicxml(elem.musicxml, elem.staffType);
        if (musicxml === null) {
          return null;
        }

        if (!(await uploadMusicxmlFile(nextElem.key, musicxml))) {
          return null;
        }

        res.push(nextElem);
        break;
    }
  }
  return res;
}

export type DraftInfo = {
  id: string;
  title: string;
};
export async function getDrafts(): Promise<DraftInfo[] | null> {
  try {
    const worksheetsCol = collection(db, 'drafts');
    const worksheetSnap = await getDocs(worksheetsCol);
    return worksheetSnap.docs.map((doc) => ({
      id: doc.id,
      title: doc.get('title') as string,
    }));
  } catch (e) {
    console.log(e);
  }
  return null;
}

export async function addDraft(title: string): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'drafts'), {
      title,
      deployId: '',
      data: '[]',
    });
    return docRef.id;
  } catch (e) {
    console.log(e);
  }
  return null;
}

export async function deleteDraft(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, `/drafts/${id}`);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.log(e);
  }
  return false;
}

export type DraftDetail = {
  title: string;
  deployId: string;
  state: EditorState;
};
export async function loadDraftDetail(id: string): Promise<DraftDetail | null> {
  try {
    const docRef = doc(db, 'drafts', id);
    const docSnap = await getDoc(docRef);
    const draft = docSnap.data() as {
      title: string;
      deployId: string;
      data: string;
    };

    const firebaseData = JSON.parse(draft.data) as Worksheet;
    const data = await firestoreWorksheetToWorksheet(firebaseData);
    const res = {
      title: draft.title,
      state: {
        title: draft.title,
        currentInd: 0,
        redoable: false,
        undoable: false,
        worksheetHistory: [data],
      },
      deployId: draft.deployId,
    };
    return res;
  } catch (e) {
    console.log(e);
  }
  return null;
}

export async function saveDraftDetail(
  id: string,
  state: EditorState,
): Promise<boolean> {
  const { title, worksheetHistory } = state;
  try {
    const docRef = doc(db, 'drafts', id);
    const len = worksheetHistory.length;
    const lastWorksheet = worksheetHistory[len - 1] ?? null;

    let data: Worksheet = [];
    if (lastWorksheet !== null) {
      data = await worksheetToFirestoreWorksheet(lastWorksheet);
    }

    const ret = {
      title,
      data: JSON.stringify(data),
    };

    await updateDoc(docRef, ret);
    return true;
  } catch (e) {
    console.log(e);
  }

  return false;
}

export async function deployDraft(id: string): Promise<string | null> {
  const worksheet = await loadDraftDetail(id);
  if (worksheet === null) {
    return null;
  }

  const worksheetHistory = worksheet.state.worksheetHistory;
  const len = worksheetHistory.length;
  const lastWorksheet = worksheetHistory[len - 1] ?? null;
  if (lastWorksheet === null) {
    return null;
  }

  const data = await draftToPublishWorksheet(lastWorksheet);
  if (data === null) {
    return null;
  }
  const nextWorksheet = {
    title: worksheet.title,
    data: JSON.stringify(data),
  };

  try {
    const docRef = doc(db, 'drafts', id);

    const deployId = worksheet.deployId;
    console.log(deployId);

    if (deployId !== '' && deployId !== undefined) {
      const worksheetRef = doc(db, 'worksheets', deployId);
      await setDoc(worksheetRef, nextWorksheet);
      return deployId;
    } else {
      const worksheetRef = await addDoc(
        collection(db, 'worksheets'),
        nextWorksheet,
      );
      await updateDoc(docRef, {
        deployId: worksheetRef.id,
      });
      return worksheetRef.id;
    }
  } catch (e) {
    console.log(e);
  }
  return null;
}

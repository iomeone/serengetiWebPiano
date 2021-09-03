import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore/lite';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { Sheet } from 'models/Worksheet';
import { ContentType, Image, Worksheet, WorksheetInfo } from 'models/Worksheet';

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

export async function getWorksheets(): Promise<
  | {
      id: string;
      title: string;
    }[]
  | null
> {
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

export async function getWorksheetDetail(
  id: string,
): Promise<WorksheetInfo | null> {
  try {
    const docRef = doc(db, 'worksheets', id);
    const docSnap = await getDoc(docRef);
    const worksheet = docSnap.data() as {
      title: string;
      data: string;
    };

    const firebaseData = JSON.parse(worksheet.data) as Worksheet;
    const data = await firestoreWorksheetToWorksheet(firebaseData);
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
  worksheet: Worksheet,
): Promise<Worksheet> {
  const res = [];
  for (const elem of worksheet) {
    switch (elem.type) {
      case ContentType.Paragraph: {
        res.push(elem);
        break;
      }
      case ContentType.Image: {
        const blankImage = {
          type: ContentType.Image,
          key: elem.key,
          title: elem.title,
          file: null,
          url: null,
        } as Image;
        const file = await getImageFile(elem.key);
        if (file === null) {
          res.push(blankImage);
          break;
        }

        res.push({
          type: ContentType.Image,
          key: elem.key,
          file,
          title: elem.title,
          url: URL.createObjectURL(file),
        } as Image);
        break;
      }
      case ContentType.Sheet: {
        const blankSheet = {
          key: elem.key,
          type: ContentType.Sheet,
          title: elem.title,
          staffType: elem.staffType,
          musicxml: null,
        } as Sheet;
        const file = await getMusicxmlFile(elem.key);
        if (file === null) {
          res.push(blankSheet);
          break;
        } else {
          res.push({
            key: elem.key,
            type: ContentType.Sheet,
            musicxml: await file.text(),
            staffType: elem.staffType,
            title: elem.title,
          } as Sheet);
          break;
        }
      }
    }
  }
  return res;
}
export function worksheetToFirestoreWorksheet(
  firestoreWorksheet: Worksheet,
): Worksheet {
  const res = [];
  for (const elem of firestoreWorksheet) {
    switch (elem.type) {
      case ContentType.Paragraph: {
        res.push(elem);
        break;
      }
      case ContentType.Image: {
        if (elem.file !== null) {
          uploadImageFile(elem.key, elem.file);
        }
        res.push({
          type: ContentType.Image,
          key: elem.key,
          title: elem.title,
          file: null,
          url: null,
        } as Image);
        break;
      }
      case ContentType.Sheet: {
        if (elem.musicxml !== null) {
          uploadMusicxmlFile(elem.key, elem.musicxml);
        }
        res.push({
          type: ContentType.Sheet,
          key: elem.key,
          title: elem.title,
          musicxml: null,
          staffType: elem.staffType,
        } as Sheet);
        break;
      }
    }
  }
  return res;
}

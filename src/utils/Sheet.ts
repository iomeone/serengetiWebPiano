import { Sheet } from 'models/Sheet';

export function isLoadedSheet(sheet: Sheet | null) {
  return sheet !== null && sheet.loaded;
}

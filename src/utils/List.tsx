import produce from 'immer';

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export function swap<T>(arr: T[], index1: number, index2: number): T[] {
  return produce(arr, (draft) => {
    [draft[index1], draft[index2]] = [draft[index2], draft[index1]];
  });
}

export type Indexed<T> = {
  content: T;
  key: number;
};

export function index<T>(array: T[]): Indexed<T>[] {
  return array.map((item, ind) => ({
    key: ind,
    content: item,
  }));
}

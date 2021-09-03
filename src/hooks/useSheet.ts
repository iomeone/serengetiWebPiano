import { Sheet } from 'models/Sheet';
import { State } from 'modules/State';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isLoadedSheet } from 'utils/Sheet';

type SheetRes = {
  sheet: Sheet | null;
  isLoaded: boolean;
};

export function useSheet(sheetKey: string): SheetRes {
  const sheet: Sheet | null = useSelector(
    (state: State) => state.audio.sheets[sheetKey] ?? null,
  );
  const isLoaded = useMemo(() => isLoadedSheet(sheet), [sheet]);

  return { sheet, isLoaded };
}

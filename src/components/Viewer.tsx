import { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { useDispatch } from 'react-redux';
import { addSheet } from 'modules/audio';

type ViewerProps = {
  sheetKey: string;
  hidden?: boolean;
};

export default function Viewer({ sheetKey, hidden }: ViewerProps) {
  const dispatch = useDispatch();
  const osmdDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (osmdDivRef.current !== null) {
      const osmd = new OSMD(osmdDivRef.current, {
        backend: 'svg',
        drawLyricist: false,
        drawLyrics: false,
        drawFingerings: true,
        drawTitle: false,
        drawComposer: false,
        drawCredits: false,
        drawSubtitle: false,
        drawPartNames: false,
        drawPartAbbreviations: false,
        drawingParameters: 'compact',
      });

      dispatch(addSheet(sheetKey, osmd));
    }
  }, [osmdDivRef, dispatch, sheetKey]);

  return (
    <div
      ref={osmdDivRef}
      style={{
        display: hidden === true ? 'none' : 'block',
      }}
    ></div>
  );
}

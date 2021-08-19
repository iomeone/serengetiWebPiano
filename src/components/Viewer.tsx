import { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { useDispatch } from 'react-redux';
import { addSheet } from 'modules/audio';

type ViewerProps = {
  key: string;
  hidden?: boolean;
};

export default function Viewer({ key, hidden }: ViewerProps) {
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

      dispatch(addSheet(key, osmd));
    }
  }, [osmdDivRef, dispatch, key]);

  return (
    <div
      ref={osmdDivRef}
      style={{
        display: hidden === true ? 'none' : 'block',
      }}
    ></div>
  );
}

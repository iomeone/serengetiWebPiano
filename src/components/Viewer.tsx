import { useEffect } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setOSMD } from 'modules/sheet';

export default function Viewer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const osmd = new OSMD('osmd-container', {
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

    dispatch(setOSMD(osmd));
  }, []);

  return <div id="osmd-container"></div>;
}

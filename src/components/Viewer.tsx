import { useEffect } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setOSMD } from 'modules/sheet';

export default function Viewer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const osmd = new OSMD('osmdContainer', {
      backend: 'svg',
      drawTitle: false,
    });

    dispatch(setOSMD(osmd));
  }, []);

  return <div id="osmdContainer"></div>;
}

import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { useEffect, useState } from 'react';

type Props = {
  content: File | null;
};

export default function Viewer({ content }: Props) {
  const [osmd, setOsmd] = useState<OSMD | null>(null);

  useEffect(() => {
    setOsmd(
      new OSMD('osmdContainer', {
        backend: 'svg',
        drawTitle: false,
      }),
    );
  }, []);

  useEffect(() => {
    (async () => {
      if (osmd !== null && content !== null) {
        await osmd.load(await content.text());
        osmd.render();
      }
    })();
  }, [osmd, content]);

  return <div id="osmdContainer"></div>;
}

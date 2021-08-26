import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { useDispatch, useSelector } from 'react-redux';
import { addSheet, cleanupSheetThunk } from 'modules/audio';
import { State } from 'modules/State';
import { Sheet } from 'models/Sheet';
import { isLoadedSheet } from 'utils/Sheet';
import styled from 'styled-components';
import { getMeasureBoundingBoxes, Rect } from 'utils/OSMD';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';

const Cont = styled.div`
  position: relative;
`;

type BoxProps = {
  selected: boolean;
};

const Box = styled.div<BoxProps>`
  position: absolute;
  background-color: ${(props) =>
    props.selected ? '#91d5ff66' : 'transparent'};
  cursor: pointer;
`;

type ViewerProps = {
  sheetKey: string;
  hidden?: boolean;
};

export default function Viewer({ sheetKey, hidden }: ViewerProps) {
  const dispatch = useDispatch();
  const osmdDivRef = useRef<HTMLDivElement>(null);
  const [measureBoxes, setMeasureBoxes] = useState<Rect[] | null>(null);
  const [hoveringBoxInd, setHoveringBoxInd] = useState<number | null>(null);
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);

  const sheet: Sheet | null = useSelector(
    (state: State) => state.audio.sheets[sheetKey] ?? null,
  );

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

  useEffect(() => {
    if (isLoadedSheet(sheet)) {
      setMeasureBoxes(getMeasureBoundingBoxes(sheet.osmd));
    }
  }, [sheet]);

  useEffect(() => {
    if (measureBoxes !== null) {
    }
  }, [measureBoxes]);

  useLayoutEffect(() => {
    return () => {
      dispatch(cleanupSheetThunk(sheetKey));
    };
  }, []);

  return (
    <Cont>
      <div
        ref={osmdDivRef}
        style={{
          display: hidden === true ? 'none' : 'block',
        }}
      ></div>
      {measureBoxes !== null &&
        measureBoxes.map((box, ind) => (
          <Box
            onClick={async () => {
              const service =
                await getOrCreateFrontPlaybackServiceWithGesture();
              service?.jumpToMeasure(ind);
            }}
            onMouseEnter={() => {
              setHoveringBoxInd(ind);
            }}
            onMouseLeave={() => {
              setHoveringBoxInd(null);
            }}
            key={ind}
            selected={ind === hoveringBoxInd}
            style={{
              left: box.left,
              top: box.top,
              width: box.right - box.left,
              height: box.bottom - box.top,
            }}
          ></Box>
        ))}
    </Cont>
  );
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { useDispatch } from 'react-redux';
import {
  addSheet,
  cleanupSheetThunk,
  stopOtherPlaybackServicesThunk,
} from 'modules/audio';
import styled from 'styled-components';
import { getMeasureBoundingBoxes, Rect } from 'utils/OSMD';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import { useSheet } from 'hooks/useSheet';

type ContProps = {
  x: number;
};

const Cont = styled.div<ContProps>`
  position: relative;
  transform: translateX(-${(props) => props.x}px);
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
  const [positionX, setPositionX] = useState(0);
  const [hoveringBoxInd, setHoveringBoxInd] = useState<number | null>(null);
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);
  const { sheet, isLoaded: isSheetLoaded } = useSheet(sheetKey);

  useEffect(() => {
    if (osmdDivRef.current !== null) {
      const osmd = new OSMD(osmdDivRef.current, {
        autoResize: false,
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

  const [measureBoxes, setMeasureBoxes] = useState<Rect[] | null>(null);
  useEffect(() => {
    if (isSheetLoaded) {
      setMeasureBoxes(getMeasureBoundingBoxes(sheet?.osmd));
    }
  }, [sheet]);

  useLayoutEffect(() => {
    return () => {
      dispatch(cleanupSheetThunk(sheetKey));
    };
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (
      sheet !== null &&
      sheet.currentMeasureInd !== null &&
      measureBoxes !== null
    ) {
      const index = Math.min(sheet.currentMeasureInd, measureBoxes.length - 1);
      if (measureBoxes[index].right - positionX > window.innerWidth) {
        setPositionX(measureBoxes[index].left - 50);
      } else if (measureBoxes[index].right - positionX < 0) {
        setPositionX(measureBoxes[index].left - 50);
      }
    }
  }, [sheet?.currentMeasureInd]);

  return (
    <Cont x={positionX}>
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
              dispatch(stopOtherPlaybackServicesThunk(sheetKey));
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

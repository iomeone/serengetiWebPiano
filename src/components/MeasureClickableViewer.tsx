import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { stopOtherPlaybackServicesThunk } from 'modules/audio';
import styled from 'styled-components';
import { getMeasureBoundingBoxes, Rect } from 'utils/OSMD';
import { useFrontPlaybackService } from 'hooks/useFrontPlaybackService';
import { useSheet } from 'hooks/useSheet';
import Viewer, { ResizeState } from './Viewer';

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
  onResize?: (resize: ResizeState) => void;
};

export default function MeasureClickableViewer({
  sheetKey,
  hidden,
  onResize,
}: ViewerProps) {
  const dispatch = useDispatch();
  const [hoveringBoxInd, setHoveringBoxInd] = useState<number | null>(null);
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);
  const { sheet, isLoaded: isSheetLoaded } = useSheet(sheetKey);

  const [measureBoxes, setMeasureBoxes] = useState<Rect[] | null>(null);
  const [resize, setResize] = useState<ResizeState>(ResizeState.Init);

  useEffect(() => {
    if (isSheetLoaded && resize === ResizeState.ResizeEnd) {
      setMeasureBoxes(getMeasureBoundingBoxes(sheet?.osmd));
    }
  }, [sheet, isSheetLoaded, resize]);

  return (
    <Cont>
      <Viewer
        sheetKey={sheetKey}
        hidden={hidden}
        onResize={(resize) => {
          setResize(resize);
          if (onResize !== undefined) {
            onResize(resize);
          }
        }}
      ></Viewer>
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

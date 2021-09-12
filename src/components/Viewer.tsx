import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  IOSMDOptions,
  OpenSheetMusicDisplay as OSMD,
  VexFlowMusicSheetCalculator,
} from 'opensheetmusicdisplay';
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
import { Sheet } from 'models/Sheet';
import { PlaybackState } from 'services/IPlaybackService';

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

enum ResizeState {
  Init,
  ResizeStart,
  ResizeEnd,
}

export default function Viewer({ sheetKey, hidden }: ViewerProps) {
  const dispatch = useDispatch();
  const osmdDivRef = useRef<HTMLDivElement>(null);
  const [hoveringBoxInd, setHoveringBoxInd] = useState<number | null>(null);
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);
  const { sheet, isLoaded: isSheetLoaded } = useSheet(sheetKey);

  const [resize, setResize] = useState<ResizeState>(ResizeState.Init);
  useEffect(() => {
    if (resize === ResizeState.ResizeStart) {
      if (isSheetLoaded) {
        const service = sheet?.playbackService ?? null;
        if (
          service !== null &&
          sheet?.playbackState === PlaybackState.PLAYING
        ) {
          service.pause();
        }
      }
    }
  }, [resize, isSheetLoaded]);

  useEffect(() => {
    if (osmdDivRef.current !== null) {
      const osmd = new CustomResizeOSMD(
        osmdDivRef.current,
        () => {
          setResize(ResizeState.ResizeStart);
        },
        () => {
          setResize(ResizeState.ResizeEnd);
        },
        {
          autoResize: true,
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
        },
      );

      dispatch(addSheet(sheetKey, osmd));
    }
  }, [osmdDivRef, dispatch, sheetKey]);

  const [measureBoxes, setMeasureBoxes] = useState<Rect[] | null>(null);
  useEffect(() => {
    if (isSheetLoaded && resize === ResizeState.ResizeEnd) {
      setMeasureBoxes(getMeasureBoundingBoxes(sheet?.osmd));
    }
  }, [sheet, isSheetLoaded, resize]);

  useLayoutEffect(() => {
    return () => {
      dispatch(cleanupSheetThunk(sheetKey));
    };
    //eslint-disable-next-line
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

class CustomResizeOSMD extends OSMD {
  constructor(
    container: string | HTMLElement,
    resizeStart: () => void,
    resizeEnd: () => void,
    options?: IOSMDOptions | undefined,
  ) {
    super(container, {
      ...options,
      autoResize: false,
    });
    this.autoResizeEnabled = true;
    this.handleResize(resizeStart, () => {
      if (this.graphic?.GetCalculator instanceof VexFlowMusicSheetCalculator) {
        // null and type check
        (
          this.graphic.GetCalculator as VexFlowMusicSheetCalculator
        ).beamsNeedUpdate = true;
      }
      if (this.IsReadyToRender()) {
        this.render();
      }
      resizeEnd();
    });
  }
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  IOSMDOptions,
  OpenSheetMusicDisplay as OSMD,
  VexFlowMusicSheetCalculator,
} from 'opensheetmusicdisplay';
import { useDispatch } from 'react-redux';
import { addSheet, cleanupSheetThunk } from 'modules/audio';
import { useSheet } from 'hooks/useSheet';
import { PlaybackState } from 'services/IPlaybackService';

type ViewerProps = {
  sheetKey: string;
  hidden?: boolean;
  onResize?: (resize: ResizeState) => void;
};

export enum ResizeState {
  Init,
  ResizeStart,
  ResizeEnd,
}

export default function Viewer({ sheetKey, hidden, onResize }: ViewerProps) {
  const dispatch = useDispatch();
  const osmdDivRef = useRef<HTMLDivElement>(null);
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
    //eslint-disable-next-line
  }, [resize, isSheetLoaded]);

  useEffect(() => {
    if (onResize !== undefined) {
      onResize(resize);
    }
    //eslint-disable-next-line
  }, [resize]);

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

  useLayoutEffect(() => {
    return () => {
      dispatch(cleanupSheetThunk(sheetKey));
    };
    //eslint-disable-next-line
  }, []);

  return (
    <div
      ref={osmdDivRef}
      style={{
        display: hidden === true ? 'none' : 'block',
      }}
    ></div>
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

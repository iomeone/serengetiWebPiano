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
import { MeasureRange } from 'utils/Editor';
import { isArrayBindingPattern } from 'typescript';

type ContProps = {
  x: number;
};

const Cont = styled.div<ContProps>`
  position: relative;
  transform: translateX(-${(props) => props.x}px);
`;

type BoxProps = {
  selected: boolean;
  isRange: ()=>Boolean;
};

const Box = styled.div<BoxProps>`
  position: absolute;
  background-color: ${(props) => {
    if(props.selected){
      return '#91d5ff66';
    } else {
      return props.isRange() ?  '#80ED9966' :'transparent' ;
    }
  }};
  cursor: pointer;
`;

type SheetEditorProps = {
  sheetKey: string;
  showModal: (start:number, end:number)=>void;
  hidden?: boolean;
  range: MeasureRange|null;
};

export default function SheetEditor({ sheetKey, showModal , hidden,range }: SheetEditorProps) {
  const dispatch = useDispatch();
  const osmdDivRef = useRef<HTMLDivElement>(null);
  const [positionX, setPositionX] = useState(0);
  const [hoveringBoxInd, setHoveringBoxInd] = useState<number | null>(null);
  const { getOrCreateFrontPlaybackServiceWithGesture } =
    useFrontPlaybackService(sheetKey);
  const { sheet, isLoaded: isSheetLoaded } = useSheet(sheetKey);

  const [startInd, setStartInd] = useState<number|null>(null);
  const [endInd, setEndInd] = useState<number|null>(null);

  useEffect(()=>{
    if(startInd !== null && endInd !== null){
      showModal(startInd, endInd);
      setStartInd(null);
      setEndInd(null);
    }
  },[startInd,endInd]);

  //TODO: sheetClick => function
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
  }, [sheet, isSheetLoaded]);

  useLayoutEffect(() => {
    return () => {
      dispatch(cleanupSheetThunk(sheetKey));
    };
    //eslint-disable-next-line
  }, []);

  const MeasureClick = (ind:number) => {
    console.log(startInd, endInd);
    if(startInd === null){
      setStartInd(ind);
    } else{
      if(startInd <= ind){
        setEndInd(ind);
      } else {
        setStartInd(ind);
      }
    }
  } 

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
            onClick={()=>{
              MeasureClick(ind)
            }}
            onMouseEnter={() => {
              setHoveringBoxInd(ind);
            }}
            onMouseLeave={() => {
              setHoveringBoxInd(null);
            }}
            key={ind}
            isRange={()=>{
              if(range !== null){
                return range.start <= ind  && range.end >= ind;
              }
              return false;
            }}
            selected={startInd === ind || endInd === ind || hoveringBoxInd === ind }
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

import { UploadOutlined } from '@ant-design/icons';
import { Button, Divider, Space } from 'antd';
import CutMeasureInfo from 'components/CutMeasureInfo';
import LoadSheetModal from 'components/LoadSheetModal';
import ResponsiveCont from 'components/ResponsiveCont';
import SheetEditor from 'components/SheetEditor';
import { Sheet } from 'models/Sheet';
import { StaffType } from 'models/Worksheet';
import { loadSheetThunk } from 'modules/audio';
import { State } from 'modules/State';
import { Staff } from 'opensheetmusicdisplay/build/dist/src';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MeasureRange, processMusicxml } from 'utils/Editor';

export default function OSMDEditorRoute() {
  const dispatch = useDispatch();
  const [loadModal, setLoadModal] = useState(false);
  const [range, setRange] = useState<MeasureRange | null>(null);
  const sheetKey = 'asdf'; // TODO createSheetKey function
  const sheet = useSelector(
    (state: State) => (state.audio.sheets[sheetKey] ?? null) as Sheet | null,
  );
  const [rangeArray, setRangeArray] = useState<MeasureRange[]>([]);

  const showModal = (start: number, end: Number) => {
    setRange({ start, end } as MeasureRange);
  };
  useEffect(() => {
    setRange(null);
  }, [sheet]);

  const appendMeasureRange = useCallback(() => {
    if (range) {
      setRangeArray([...rangeArray, range]);
    }
  }, [rangeArray, range]);

  const download = useCallback(() => {
    const res = JSON.stringify(rangeArray);
    const element = document.createElement('a');
    const file = new Blob([res], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'cropped_' + sheet!.title?.split('.')[0] + '.json';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }, [rangeArray]);
  return (
    <>
      <LoadSheetModal
        onLoadFile={(file) => {
          dispatch(loadSheetThunk(sheetKey, file.originFileObj as File));
        }}
        visible={loadModal}
        onVisibleChange={setLoadModal}
      ></LoadSheetModal>

      <ResponsiveCont>
        <Space
          direction="vertical"
          size={8}
          style={{
            marginTop: 20,
          }}
        >
          <Button
            onClick={() => {
              setLoadModal(true);
            }}
          >
            <UploadOutlined />
            악보 업로드
          </Button>
          <CutMeasureInfo
            sheetKey={sheetKey}
            range={range}
            appendMeasureRange={appendMeasureRange}
          ></CutMeasureInfo>
          {rangeArray.map((value, index) => {
            return (
              <div style={{ width: 300 }}>
                <span style={{ marginRight: 10 }}>
                  {value.start + 1} ~ {value.end + 1}
                </span>
                <Button
                  onClick={() => {
                    rangeArray.splice(index, 1);
                    setRangeArray([...rangeArray]);
                  }}
                >
                  지우기
                </Button>
              </div>
            );
          })}
          <Button
            onClick={() => {
              download();
            }}
          >
            다운로드
          </Button>
        </Space>
      </ResponsiveCont>
      <Space
        direction="vertical"
        size={8}
        style={{
          marginTop: 20,
        }}
      >
        <Divider />
        <SheetEditor
          showModal={showModal}
          sheetKey={sheetKey}
          range={range}
        ></SheetEditor>
      </Space>
    </>
  );
}

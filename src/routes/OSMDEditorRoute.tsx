import { UploadOutlined } from '@ant-design/icons';
import { Button, Divider, Space } from 'antd';
import CutMeasureInfo from 'components/CutMeasureInfo';
import LoadSheetModal from 'components/LoadSheetModal';
import ResponsiveCont from 'components/ResponsiveCont';
import SheetEditor from 'components/SheetEditor';
import { Size } from 'constants/layout';
import { Sheet } from 'models/Sheet';
import { loadSheetThunk } from 'modules/audio';
import { State } from 'modules/State';
import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MeasureRange } from 'utils/Editor';

export default function OSMDEditorRoute() {
    const dispatch = useDispatch();
  const [loadModal, setLoadModal] = useState(false);
  const [range, setRange] = useState<MeasureRange|null>(null);
  const sheetKey = "asdf";// TODO createSheetKey function 
  const sheet = useSelector(
    (state: State) => (state.audio.sheets[sheetKey] ?? null) as Sheet | null,
  );
  
  const showModal = (start:number, end:Number) => {
    setRange({start,end} as MeasureRange);
  };
  useEffect(()=>{
    setRange(null);
  },[sheet]);
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
        ></CutMeasureInfo>
        </Space>
      </ResponsiveCont>
      <Space
          direction="vertical"
          size={8}
          style={{
            marginTop: 20
          }}
        >
        <Divider />
        <SheetEditor showModal={showModal} sheetKey={sheetKey} range={range}></SheetEditor>
      </Space>
    </>
  );
}

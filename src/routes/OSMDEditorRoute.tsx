import { UploadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import LoadSheetModal from 'components/LoadSheetModal';
import ResponsiveCont from 'components/ResponsiveCont';
import { useState } from 'react';

export default function OSMDEditorRoute() {
  const [loadModal, setLoadModal] = useState(false);
  const [sheetFile, setSheetFile] = useState<File | null>(null);
   
  return (
    <>
      <LoadSheetModal
        onLoadFile={(file) => {
          setSheetFile(file.originFileObj as File);
        }}
        visible={loadModal}
        onVisibleChange={setLoadModal}
      ></LoadSheetModal>
      <ResponsiveCont>
        <Button 
            style={{
                margin:"auto 0px"
            }}
          onClick={() => {
            setLoadModal(true);
          }}
        >
          <UploadOutlined />
          악보 업로드
        </Button>
        
      </ResponsiveCont>
    </>
  );
}

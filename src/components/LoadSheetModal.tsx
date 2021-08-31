import { InboxOutlined } from '@ant-design/icons';
import { message, Modal, Space, Typography, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  file?: UploadFile<any> | null;
  onFileChange?: (file: UploadFile<any> | null) => void;
  onLoadFile: (file: UploadFile<any>) => void;
};

export default function LoadSheetModal({
  visible,
  onVisibleChange,
  file,
  onFileChange,
  onLoadFile,
}: Props) {
  const [myFile, setMyFile] = useState<UploadFile<any> | null>(null);

  useEffect(() => {
    if (file !== undefined) setMyFile(file);
  }, [file, onFileChange]);

  const onMyFileChange = useCallback(
    (newFile: UploadFile<any>) => {
      if (onFileChange !== undefined) {
        onFileChange(newFile);
      }
      setMyFile(newFile);
    },
    [setMyFile, onFileChange],
  );

  return (
    <Modal
      visible={visible}
      title="MusicXML 파일 업로드"
      onOk={() => {
        if (myFile === null || myFile === undefined) {
          message.error('업로드 완료 후 버튼을 눌러주세요.');
          return;
        }

        onVisibleChange(false);
        onLoadFile(myFile);
      }}
      onCancel={() => {
        onVisibleChange(false);
      }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Typography.Text>MusicXML 파일을 업로드해주세요.</Typography.Text>
        <Upload.Dragger
          name="file"
          multiple={false}
          customRequest={(e) => {
            if (e.onSuccess) e.onSuccess({}, new XMLHttpRequest());
          }}
          onChange={(e) => {
            onMyFileChange(e.file ?? null);
          }}
          fileList={myFile === null ? [] : [myFile]}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">클릭하거나 파일을 드래그해서 업로드</p>
          <p className="ant-upload-hint">
            1개의 MusicXML 파일을 업로드해주세요.
          </p>
        </Upload.Dragger>
        <Typography.Text>
          업로드 완료 후 확인 버튼을 눌러주세요.
        </Typography.Text>
      </Space>
    </Modal>
  );
}

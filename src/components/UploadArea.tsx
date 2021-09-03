import { InboxOutlined } from '@ant-design/icons';
import { Button, Space, Typography, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  file?: UploadFile<any> | null;
  onFileChange?: (file: UploadFile<any> | null) => void;
  onLoadFile: (file: UploadFile<any>) => void;
  fileType: string;
};

export default function UploadArea({
  file,
  onFileChange,
  onLoadFile,
  fileType,
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
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Typography.Text>{fileType} 파일을 업로드해주세요.</Typography.Text>
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
          1개의 {fileType} 파일을 업로드해주세요.
        </p>
      </Upload.Dragger>
      <Typography.Text>업로드 완료 후 확인 버튼을 눌러주세요.</Typography.Text>
      <Button
        type="primary"
        disabled={myFile === null}
        onClick={() => {
          if (myFile !== null) onLoadFile(myFile);
        }}
      >
        확인
      </Button>
    </Space>
  );
}

type ImageUploadAreaProps = {
  file?: UploadFile<any> | null;
  onFileChange?: (file: UploadFile<any> | null) => void;
  onLoadFile: (file: UploadFile<any>) => void;
};

export function ImageUploadArea(props: ImageUploadAreaProps) {
  return <UploadArea {...props} fileType="이미지"></UploadArea>;
}

type MusicxmlUploadAreaProps = {
  file?: UploadFile<any> | null;
  onFileChange?: (file: UploadFile<any> | null) => void;
  onLoadFile: (file: UploadFile<any>) => void;
};

export function MusicxmlUploadArea(props: MusicxmlUploadAreaProps) {
  return <UploadArea {...props} fileType="Musicxml"></UploadArea>;
}

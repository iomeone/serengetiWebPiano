import { Button, Space, Typography } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEditor } from 'hooks/useEditor';
import produce from 'immer';
import { EditorImage } from 'models/EditorWorksheet';
import { ImageUploadArea } from './UploadArea';
import TextEditor from './TextEditor';

type ImageElementEditorProps = {
  elem: EditorImage;
  elemInd: number;
};

export default function ImageElementEditor({
  elem,
  elemInd,
}: ImageElementEditorProps) {
  const { updateElem } = useEditor();

  const submit = (title: string) => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.title = title;
      }),
    );
  };

  const loadFile = (file: UploadFile<any>) => {
    const fileObj = file.originFileObj as File;
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.file = fileObj;
        draft.previewUrl = URL.createObjectURL(fileObj);
      }),
    );
  };

  const resetFile = () => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.file = null;
        draft.previewUrl = '';
      }),
    );
  };

  return (
    <Space
      direction="vertical"
      size={8}
      style={{
        width: '100%',
      }}
    >
      <TextEditor title={elem.title} onSubmit={submit} tag="이름"></TextEditor>
      {elem.file === null ? (
        <ImageUploadArea
          onLoadFile={(file) => {
            loadFile(file);
          }}
        ></ImageUploadArea>
      ) : (
        <Space
          direction="vertical"
          size={6}
          style={{
            width: '100%',
          }}
        >
          <Typography.Text
            style={{
              fontWeight: 'bold',
            }}
          >
            미리보기
          </Typography.Text>
          <img
            style={{ width: '100%', height: 'auto' }}
            alt={elem.title}
            src={elem.previewUrl ?? ''}
          ></img>
          <Button
            onClick={() => {
              resetFile();
            }}
          >
            다시 업로드
          </Button>
        </Space>
      )}
    </Space>
  );
}

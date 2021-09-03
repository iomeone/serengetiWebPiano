import { Button, Space, Typography } from 'antd';
import { useEditor } from 'hooks/useEditor';
import produce from 'immer';
import { ImageUploadArea } from './UploadArea';
import TextEditor from './TextEditor';
import { Image } from 'models/Worksheet';

type ImageElementEditorProps = {
  elem: Image;
  elemInd: number;
};

export default function ImageElementEditor({
  elem,
  elemInd,
}: ImageElementEditorProps) {
  const { updateElem, loadImageFile } = useEditor();

  const submit = (title: string) => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.title = title;
      }),
    );
  };

  const resetFile = () => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.file = null;
        draft.url = null;
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
            loadImageFile(elem, elemInd, file);
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
            src={elem.url ?? ''}
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

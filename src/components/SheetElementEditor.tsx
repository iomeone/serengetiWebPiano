import { Alert, Button, Space, Typography } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEditor } from 'hooks/useEditor';
import produce from 'immer';
import { EditorSheet, StaffType } from 'models/EditorWorksheet';
import SegmentViewer from './SegmentViewer';
import TextEditor from './TextEditor';
import { MusicxmlUploadArea } from './UploadArea';

type Props = {
  elem: EditorSheet;
  elemInd: number;
};

export default function SheetElementEditor({ elem, elemInd }: Props) {
  const { updateElem } = useEditor();

  const submitKey = (key: string) => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.key = key;
      }),
    );
  };

  const submitTitle = (title: string) => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.title = title;
      }),
    );
  };

  const loadFile = async (file: UploadFile<any>) => {
    const fileObj = file.originFileObj as File;
    const text = await fileObj.text();

    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.musicxml = text;
      }),
    );
  };

  const resetFile = () => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.musicxml = null;
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
      <TextEditor
        title={elem.title}
        onSubmit={submitTitle}
        tag="악보 제목"
      ></TextEditor>
      <TextEditor
        title={elem.title}
        onSubmit={submitKey}
        tag="악보 키"
      ></TextEditor>
      {(() => {
        if (elem.key !== null)
          return (
            <Alert
              type="warning"
              message="악보 고유 키를 먼저 입력해주세요. 한 문서 내에서 키는 겹칠 수 없는 고유 번호입니다."
            ></Alert>
          );
        if (elem.musicxml === null)
          return (
            <MusicxmlUploadArea
              onLoadFile={(file) => {
                loadFile(file);
              }}
            ></MusicxmlUploadArea>
          );
        return (
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
            <SegmentViewer
              sheetKey={elem.key}
              title={elem.title}
              oneStaff={elem.staffType !== StaffType.BothHands}
              url={elem.musicxml}
            ></SegmentViewer>
            <Button
              onClick={() => {
                resetFile();
              }}
            >
              다시 업로드
            </Button>
          </Space>
        );
      })()}
    </Space>
  );
}

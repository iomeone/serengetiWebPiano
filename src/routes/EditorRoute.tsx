import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { MdUndo, MdRedo } from 'react-icons/md';
import {
  Button,
  Card,
  Empty,
  List,
  message,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import { Size } from 'constants/layout';
import { useEditor } from 'hooks/useEditor';
import { ContentType, EditorWorksheetElem } from 'models/Worksheet';
import { index, Indexed } from 'utils/List';
import Horizontal from 'components/Horizontal';
import ParagraphElementEditor from 'components/ParagraphElementEditor';
import { useEffect } from 'react';
import { useControlKeys } from 'hooks/useControlKeys';
import ImageElementEditor from 'components/ImageElementEditor';
import TextEditor from 'components/TextEditor';
import { setTitle } from 'modules/editor';
import { downloadAsWorksheetFiles } from 'utils/Editor';

const hMargin = Size.hMargin;

export default function EditorRoute() {
  const { currentState, addElem, deleteElem, title, setTitle } = useEditor();
  return (
    <ResponsiveCont>
      <Space
        direction="vertical"
        size={10}
        style={{
          marginTop: hMargin,
          width: '100%',
          marginBottom: 100,
        }}
      >
        <Header></Header>
        <TextEditor tag="제목" title={title} onSubmit={setTitle}></TextEditor>
        {currentState === null || currentState.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={index(currentState)}
            renderItem={(item: Indexed<EditorWorksheetElem>) => (
              <List.Item>
                <Card
                  style={{
                    width: '100%',
                  }}
                  extra={
                    <Button
                      type="text"
                      shape="circle"
                      onClick={() => {
                        deleteElem(item.key);
                      }}
                    >
                      <DeleteOutlined></DeleteOutlined>
                    </Button>
                  }
                  title={
                    <Typography.Text>
                      {contentTypeName(item.content.type)}
                    </Typography.Text>
                  }
                >
                  <WorksheetElementEditor
                    elem={item.content}
                    elemInd={item.key}
                  ></WorksheetElementEditor>
                </Card>
              </List.Item>
            )}
          ></List>
        )}
        <Space direction="horizontal" size={10}>
          <Button
            onClick={() => {
              addElem(ContentType.Paragraph);
            }}
          >
            <PlusOutlined></PlusOutlined> 글 영역 추가
          </Button>
          <Button
            onClick={() => {
              addElem(ContentType.Sheet);
            }}
          >
            <PlusOutlined></PlusOutlined> 악보 추가
          </Button>
          <Button
            onClick={() => {
              addElem(ContentType.Image);
            }}
          >
            <PlusOutlined></PlusOutlined> 이미지 추가
          </Button>
        </Space>
      </Space>
    </ResponsiveCont>
  );
}

function Header() {
  const { currentState, undo, redo, undoable, redoable, title } = useEditor();
  const { ctrlZ, ctrlY } = useControlKeys();

  const download = () => {
    if (currentState !== null) {
      if (title.length === 0) {
        message.error('제목을 입력해주세요');
        return;
      }

      downloadAsWorksheetFiles(currentState);
      message.success('Worksheet 다운로드 완료');
    }
  };

  useEffect(() => {
    if (ctrlZ) {
      undoWithMessage();
    }
  }, [ctrlZ]);

  useEffect(() => {
    if (ctrlY) {
      redoWithMessage();
    }
  }, [ctrlY]);

  const undoWithMessage = () => {
    if (undoable) {
      undo();
      message.info('실행 취소');
    }
  };

  const redoWithMessage = () => {
    if (redoable) {
      redo();
      message.info('실행 취소 되돌리기');
    }
  };

  return (
    <Horizontal>
      <Typography.Text
        style={{
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        Worksheet Editor
      </Typography.Text>
      <Space direction="horizontal" size={8}>
        <Tooltip title="Undo">
          <Button
            disabled={!undoable}
            shape="circle"
            type="text"
            onClick={() => {
              undoWithMessage();
            }}
          >
            <MdUndo></MdUndo>
          </Button>
        </Tooltip>
        <Tooltip title="Redo">
          <Button
            disabled={!redoable}
            shape="circle"
            type="text"
            onClick={() => {
              redoWithMessage();
            }}
          >
            <MdRedo></MdRedo>
          </Button>
        </Tooltip>
        <Tooltip title="Download">
          <Button
            disabled={currentState === null}
            shape="circle"
            type="text"
            onClick={() => {
              download();
            }}
          >
            <DownloadOutlined></DownloadOutlined>
          </Button>
        </Tooltip>
      </Space>
    </Horizontal>
  );
}

function contentTypeName(contentType: ContentType): string {
  switch (contentType) {
    case ContentType.Paragraph:
      return '글 영역';
    case ContentType.Sheet:
      return '악보';
    case ContentType.Image:
      return '이미지';
    default:
      return '';
  }
}

type WorksheetElementEditorProps = {
  elem: EditorWorksheetElem;
  elemInd: number;
};
function WorksheetElementEditor({
  elem,
  elemInd,
}: WorksheetElementEditorProps) {
  switch (elem.type) {
    case ContentType.Paragraph:
      return (
        <ParagraphElementEditor
          elem={elem}
          elemInd={elemInd}
        ></ParagraphElementEditor>
      );
    case ContentType.Sheet:
      return <div></div>;
    case ContentType.Image:
      return (
        <ImageElementEditor elem={elem} elemInd={elemInd}></ImageElementEditor>
      );
  }
}

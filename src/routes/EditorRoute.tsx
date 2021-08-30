import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { MdUndo, MdRedo } from 'react-icons/md';
import { Button, Card, Empty, List, Space, Tooltip, Typography } from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import { Size } from 'constants/layout';
import { useEditor } from 'hooks/useEditor';
import { ContentType, WorksheetElem } from 'models/Worksheet';
import styled from 'styled-components';

const hMargin = Size.hMargin;

const Horizontal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type Indexed<T> = {
  content: T;
  key: number;
};

export default function EditorRoute() {
  const { currentState, addElem, deleteElem } = useEditor();
  return (
    <ResponsiveCont>
      <Space
        direction="vertical"
        size={10}
        style={{
          marginTop: hMargin,
          width: '100%',
        }}
      >
        <Header></Header>
        {currentState === null || currentState.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={currentState.map((state, ind) => ({
              key: ind,
              content: state,
            }))}
            renderItem={(item: Indexed<WorksheetElem>) => (
              <List.Item key={item.key}>
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
                  <WorksheetElement elem={item.content}></WorksheetElement>
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
            <PlusOutlined></PlusOutlined> 문단 추가
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
  const { undo, redo, undoable, redoable } = useEditor();
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
              undo();
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
              redo();
            }}
          >
            <MdRedo></MdRedo>
          </Button>
        </Tooltip>
      </Space>
    </Horizontal>
  );
}

function contentTypeName(contentType: ContentType): string {
  switch (contentType) {
    case ContentType.Paragraph:
      return '문단';
    case ContentType.Sheet:
      return '악보';
    case ContentType.Image:
      return '이미지';
    default:
      return '';
  }
}
type WorksheetElementProps = {
  elem: WorksheetElem;
};
function WorksheetElement({ elem }: WorksheetElementProps) {
  switch (elem.type) {
    case ContentType.Paragraph:
      return <div></div>;
    case ContentType.Sheet:
      return <div></div>;
    case ContentType.Image:
      return <div></div>;
  }
}

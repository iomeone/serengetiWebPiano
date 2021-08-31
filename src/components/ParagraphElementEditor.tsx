import {
  CheckOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useEditor } from 'hooks/useEditor';
import produce from 'immer';
import { EditorParagraph, Paragraph } from 'models/Worksheet';
import { useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import ContentEditable from './ContentEditable';
import Horizontal from './Horizontal';

type ParagraphElementEditorProps = {
  elem: Paragraph;
  elemInd: number;
};

export default function ParagraphElementEditor({
  elem,
  elemInd,
}: ParagraphElementEditorProps) {
  const { updateElem } = useEditor();

  const addParagraph = () => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.content.push([]);
      }),
    );
  };

  return (
    <Space
      direction="vertical"
      size={2}
      style={{
        width: '100%',
      }}
    >
      {elem.content.map((paragraph, paragraphInd) => (
        <ParagraphEditor
          elem={elem}
          paragraph={paragraph}
          elemInd={elemInd}
          paragraphInd={paragraphInd}
        ></ParagraphEditor>
      ))}
      <Button
        type="dashed"
        style={{
          width: '100%',
          marginTop: 8,
        }}
        onClick={() => {
          addParagraph();
        }}
      >
        <PlusOutlined></PlusOutlined> 문단 추가
      </Button>
    </Space>
  );
}

const ParagraphBox = styled.div`
  width: 100%;
  border-radius: 2px;
  border: 1px solid #69c0ff;
  padding: 3px;
`;

type ParagraphEditorProps = {
  elem: EditorParagraph;
  paragraph: string[];
  elemInd: number;
  paragraphInd: number;
};

function ParagraphEditor({
  elem,
  paragraph,
  elemInd,
  paragraphInd,
}: ParagraphEditorProps) {
  const autoSaveInterval = 800;
  const [value, setValue] = useState('');
  const [lastChanged, setLastChanged] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [saved, setSaved] = useState(true);
  const { updateElem } = useEditor();

  const deleteParagraph = () => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.content.splice(paragraphInd, 1);
      }),
    );
  };

  const save = () => {
    setSaved(true);
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.content[paragraphInd] = value.split('\n');
      }),
    );
  };

  useEffect(() => {
    if (!saved) {
      if (currentTime - lastChanged > autoSaveInterval) {
        save();
      }
    }
  }, [saved, lastChanged, currentTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, autoSaveInterval);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Horizontal>
      <ParagraphBox>
        <ContentEditable
          value={paragraph.join('\n')}
          onChange={(value) => {
            setValue(value);
            setSaved(false);
            setLastChanged(Date.now());
          }}
        ></ContentEditable>
      </ParagraphBox>
      <Space
        direction="horizontal"
        size={6}
        style={{
          marginLeft: 6,
        }}
      >
        {saved ? <CheckOutlined /> : <LoadingOutlined />}
        <Button
          type="text"
          shape="circle"
          onClick={() => {
            deleteParagraph();
          }}
        >
          <DeleteOutlined size={10}></DeleteOutlined>
        </Button>
      </Space>
    </Horizontal>
  );
}

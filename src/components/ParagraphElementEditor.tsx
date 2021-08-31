import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, List, message, Space, Typography } from 'antd';
import { useEditor } from 'hooks/useEditor';
import produce from 'immer';
import { Paragraph } from 'models/Worksheet';
import { useRef } from 'react';
import { useState } from 'react';
import { index, Indexed } from 'utils/List';
import Horizontal from './Horizontal';

type ParagraphElementEditorProps = {
  elem: Paragraph;
  elemInd: number;
};

type SentenceAdder = {
  selectedParagraphInd: number | null;
  value: string;
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

  const addSentence = (paragraphInd: number, sentence: string) => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.content[paragraphInd].push(sentence);
      }),
    );
  };

  const [sentenceAdder, setSentenceAdder] = useState<SentenceAdder>({
    selectedParagraphInd: null,
    value: '',
  });
  const sentenceAdderRef = useRef<Input>(null);
  const prepareAddSentence = (paragraphInd: number) => {
    setSentenceAdder({
      selectedParagraphInd: paragraphInd,
      value: '',
    });
    sentenceAdderRef.current?.focus();
  };
  const closeSentenceAdder = () => {
    setSentenceAdder({
      selectedParagraphInd: null,
      value: '',
    });
  };
  const onSentenceChange = (nextValue: string) => {
    setSentenceAdder((adder) => ({
      ...adder,
      value: nextValue,
    }));
  };
  const submit = (paragraphInd: number) => {
    const sentence = sentenceAdder.value;

    if (sentence.length === 0) {
      message.error('문장을 입력해주세요.');
    } else {
      onSentenceChange('');
      addSentence(paragraphInd, sentence);
      sentenceAdderRef.current?.focus();
    }
  };

  return (
    <List
      dataSource={index(elem.content)}
      renderItem={(paragraph: Indexed<string[]>) => (
        <List.Item>
          <Space
            direction="vertical"
            size={4}
            style={{
              width: '100%',
            }}
          >
            {paragraph.content.map((str, ind) => (
              <Typography.Text key={ind}>{str}</Typography.Text>
            ))}
            {sentenceAdder.selectedParagraphInd === paragraph.key ? (
              <Horizontal>
                <Input
                  ref={sentenceAdderRef}
                  value={sentenceAdder.value}
                  onChange={(e) => {
                    onSentenceChange(e.target.value);
                  }}
                  onPressEnter={() => {
                    submit(paragraph.key);
                  }}
                ></Input>
                <Space
                  direction="horizontal"
                  size={6}
                  style={{
                    marginLeft: 6,
                  }}
                >
                  <Button
                    type="primary"
                    onClick={() => {
                      submit(paragraph.key);
                    }}
                  >
                    <PlusOutlined></PlusOutlined> 문장 추가
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      closeSentenceAdder();
                    }}
                  >
                    닫기
                  </Button>
                </Space>
              </Horizontal>
            ) : (
              <Button
                onClick={() => {
                  prepareAddSentence(paragraph.key);
                }}
              >
                <PlusOutlined></PlusOutlined> 문장 추가
              </Button>
            )}
          </Space>
        </List.Item>
      )}
    >
      <Button
        type="dashed"
        style={{
          width: '100%',
        }}
        onClick={() => {
          addParagraph();
        }}
      >
        <PlusOutlined></PlusOutlined> 문단 추가
      </Button>
    </List>
  );
}

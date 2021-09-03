import { Alert, Button, Radio, Space, Typography } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEditor } from 'hooks/useEditor';
import produce from 'immer';
import { EditorSheet, StaffType } from 'models/EditorWorksheet';
import { useEffect } from 'react';
import { useMemo } from 'react';
import {
  getScoreXml,
  getXmlDocument,
  hasMultipleStaves,
  processMusicxml,
} from 'utils/Editor';
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

  const onStaffChange = (e: any) => {
    updateElem(
      elemInd,
      produce(elem, (draft) => {
        draft.staffType = e.target.value as StaffType;
      }),
    );
  };

  const multipleStaves = useMemo(() => {
    if (elem.musicxml !== null) {
      const xmlDoc = getXmlDocument(elem.musicxml);
      const score = getScoreXml(xmlDoc);
      if (score === null) return null;
      return hasMultipleStaves(score);
    }
    return null;
  }, [elem.musicxml]);

  useEffect(() => {
    if (!multipleStaves) {
      updateElem(
        elemInd,
        produce(elem, (draft) => {
          draft.staffType = StaffType.RightHand;
        }),
      );
    }
  }, [multipleStaves]);

  const processedMusicxml = useMemo(() => {
    if (elem.musicxml !== null)
      return processMusicxml(elem.musicxml, elem.staffType);
    else return null;
  }, [elem.musicxml, elem.staffType]);

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
        if (elem.key === null)
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
        if (processedMusicxml !== null)
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
              {multipleStaves ? (
                <Radio.Group onChange={onStaffChange} value={elem.staffType}>
                  <Radio value={StaffType.BothHands}>Both Hands</Radio>
                  <Radio value={StaffType.RightHand}>Right Hand</Radio>
                  <Radio value={StaffType.LeftHand}>Left Hand</Radio>
                </Radio.Group>
              ) : (
                <Radio.Group onChange={onStaffChange} value={elem.staffType}>
                  <Radio value={StaffType.RightHand}>Right Hand</Radio>
                  <Radio value={StaffType.LeftHand}>Left Hand</Radio>
                </Radio.Group>
              )}
              <SegmentViewer
                sheetKey={elem.key}
                title={elem.title}
                oneStaff={elem.staffType !== StaffType.BothHands}
                url={processedMusicxml}
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
        return (
          <Space
            direction="vertical"
            size={6}
            style={{
              width: '100%',
            }}
          >
            <Alert
              type="error"
              message="악보 처리 실패... 다시 업로드해주세요."
            ></Alert>
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

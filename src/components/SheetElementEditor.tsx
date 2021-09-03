import { Alert, Button, Radio, Space, Typography } from 'antd';
import { useEditor } from 'hooks/useEditor';
import produce from 'immer';
import { Sheet, StaffType } from 'models/Worksheet';
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
  elem: Sheet;
  elemInd: number;
};

export default function SheetElementEditor({ elem, elemInd }: Props) {
  const { updateElem, loadMusicxmlFile } = useEditor();

  const submitTitle = (title: string) => {
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
  }, [elem, elemInd, multipleStaves, updateElem]);

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
      {(() => {
        if (elem.musicxml === null)
          return (
            <MusicxmlUploadArea
              onLoadFile={(file) => {
                loadMusicxmlFile(elem, elemInd, file);
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

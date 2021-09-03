import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Card, List, Space, Typography } from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import SegmentViewer from 'components/SegmentViewer';
import SpinLayout from 'components/SpinLayout';
import { Size } from 'constants/layout';
import { getAuth, User } from 'firebase/auth';
import { ContentType, StaffType, WorksheetInfo } from 'models/Worksheet';
import { useEffect } from 'react';
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useHistory, useParams } from 'react-router-dom';
import { getWorksheetDetail, getWorksheets } from 'utils/Server';

const margin = Size.margin;

type TypoProps = {
  children: React.ReactNode;
};

function Typo({ children }: TypoProps) {
  return (
    <Typography.Text
      style={{
        fontSize: 17,
      }}
    >
      {children}
    </Typography.Text>
  );
}

type WorksheetParam = {
  id: string | undefined;
};

export default function WorksheetRoute() {
  const { id } = useParams<WorksheetParam>();

  if (id === undefined) {
    return (
      <ResponsiveCont>
        <SelectWorksheet></SelectWorksheet>
      </ResponsiveCont>
    );
  }

  return <WorksheetViewer id={id}></WorksheetViewer>;
}

function SelectWorksheet() {
  const history = useHistory();
  const [worksheetList, setWorksheetList] = useState<
    | {
        id: string;
        title: string;
      }[]
    | null
  >(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setWorksheetList(await getWorksheets());
      setLoading(false);
    })();
  }, []);

  if (loading) return <SpinLayout></SpinLayout>;
  if (worksheetList === null) {
    return (
      <ResponsiveCont>
        <Space
          direction="vertical"
          style={{
            width: '100%',
            marginTop: 30,
          }}
        >
          <Space direction="horizontal" size={8} align="center">
            <Button
              type="text"
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                history.push('/');
              }}
            ></Button>
            <Typography.Text
              style={{
                fontSize: 16,
              }}
            >
              돌아가기
            </Typography.Text>
          </Space>
          <Alert type="error" message="오류가 발생했습니다."></Alert>
          <Button
            onClick={() => {
              history.go(0);
            }}
          >
            Reload
          </Button>
        </Space>
      </ResponsiveCont>
    );
  }

  return (
    <ResponsiveCont>
      <Space
        direction="vertical"
        size={margin}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      >
        <Typography.Text
          style={{
            fontSize: 16,
          }}
        >
          Select Worksheet
        </Typography.Text>
        <List
          grid={{
            column: 2,
            gutter: 10,
          }}
          dataSource={worksheetList}
          renderItem={(item: { id: string; title: string }) => (
            <List.Item>
              <Card
                title={
                  <Typography.Link href={`/worksheet/${item.id}`}>
                    {item.title}
                  </Typography.Link>
                }
              >
                <Typography.Text>피아노를 연습합니다.</Typography.Text>
              </Card>
            </List.Item>
          )}
        ></List>
      </Space>
    </ResponsiveCont>
  );
}

type WorksheetViewerProps = {
  id: string;
};
function WorksheetViewer({ id }: WorksheetViewerProps) {
  const history = useHistory();
  const [authLoading]: [User | null, boolean, any] = useAuthState(getAuth());

  const [worksheetInfo, setWorksheetInfo] = useState<WorksheetInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id !== undefined && !authLoading) {
      (async () => {
        setWorksheetInfo(await getWorksheetDetail(id));
        setLoading(false);
      })();
    }
  }, [id, authLoading]);

  if (loading)
    return (
      <ResponsiveCont>
        <SpinLayout></SpinLayout>
      </ResponsiveCont>
    );

  if (worksheetInfo === null)
    return (
      <ResponsiveCont>
        <Space
          direction="vertical"
          style={{
            width: '100%',
            marginTop: 30,
          }}
        >
          <Space direction="horizontal" size={8} align="center">
            <Button
              type="text"
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                history.push('/worksheet');
              }}
            ></Button>
            <Typography.Text
              style={{
                fontSize: 16,
              }}
            >
              돌아가기
            </Typography.Text>
          </Space>
          <Alert type="error" message="오류가 발생했습니다."></Alert>
          <Button
            onClick={() => {
              history.go(0);
            }}
          >
            Reload
          </Button>
        </Space>
      </ResponsiveCont>
    );

  return (
    <Space
      direction="vertical"
      size={0}
      style={{
        width: '100%',
        marginTop: 30,
      }}
    >
      <ResponsiveCont>
        <Space direction="horizontal" size={8} align="center">
          <Button
            type="text"
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              history.push('/worksheet');
            }}
          ></Button>
          <Typography.Text
            style={{
              fontSize: 16,
            }}
          >
            {worksheetInfo.title}
          </Typography.Text>
        </Space>
      </ResponsiveCont>
      <Space
        direction="vertical"
        size={50}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      >
        {worksheetInfo.worksheet.map((content, contentKey) => {
          switch (content.type) {
            case ContentType.Paragraph: {
              return (
                <ResponsiveCont key={contentKey}>
                  <Space
                    direction="vertical"
                    size={20}
                    style={{
                      width: '100%',
                    }}
                  >
                    {content.content.map((lines, lineKey) => (
                      <Space
                        key={lineKey}
                        direction="vertical"
                        size={8}
                        style={{
                          width: '100%',
                        }}
                      >
                        {lines.map((line, key) => (
                          <Typo key={key}>{line}</Typo>
                        ))}
                      </Space>
                    ))}
                  </Space>
                </ResponsiveCont>
              );
            }
            case ContentType.Sheet: {
              return (
                <div key={contentKey}>
                  <SegmentViewer
                    sheetKey={content.key}
                    title={content.title}
                    url={content.musicxml ?? ''}
                    oneStaff={content.staffType !== StaffType.BothHands}
                  ></SegmentViewer>
                </div>
              );
            }
            case ContentType.Image: {
              return (
                <ResponsiveCont key={contentKey}>
                  <img
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                    alt={content.title}
                    src={content.url ?? ''}
                  ></img>
                </ResponsiveCont>
              );
            }
            default:
              return <div key={contentKey}></div>;
          }
        })}
      </Space>
    </Space>
  );
}

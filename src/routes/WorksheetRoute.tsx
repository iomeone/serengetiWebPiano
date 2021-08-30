import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, List, Space, Typography } from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import SegmentViewer from 'components/SegmentViewer';
import SpinLayout from 'components/SpinLayout';
import { Size } from 'constants/layout';
import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

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

enum ContentType {
  Paragraph = 'Paragraph',
  Sheet = 'Sheet',
  Image = 'Image',
}

type Content<T> = {
  type: T;
};

type Paragraph = Content<ContentType.Paragraph> & {
  content: string[][];
};

type Sheet = Content<ContentType.Sheet> & {
  key: string;
  title: string;
  url: string;
  oneStaff: boolean;
};

type Image = Content<ContentType.Image> & {
  title: string;
  url: string;
};

type WorksheetElem = Paragraph | Sheet | Image;

type WorksheetParam = {
  name: string | undefined;
};

type WorksheetCard = {
  key: string;
  title: string;
  description: string;
};
const worksheetCards: WorksheetCard[] = [
  {
    key: 'dragonSpine',
    title: 'Dragon Spine',
    description:
      '테스트용 Worksheet입니다. Dragon Spine OST 작곡 Hoyo-Mix의 Yu-Peng Chen',
  },
];

export default function WorksheetRoute() {
  const [worksheet, setWorksheet] = useState<WorksheetElem[] | null>(null);

  const { name } = useParams<WorksheetParam>();
  const history = useHistory();

  useEffect(() => {
    (async () => {
      if (name !== undefined) {
        const jsonUrl = `/sheetData/dragonSpine/data.json`;
        const data = await fetch(jsonUrl);
        try {
          const nextWorksheet = (await data.json()) as WorksheetElem[];
          setWorksheet(nextWorksheet);
        } catch (e) {
          //fallback
          console.log(e);
          history.push('/worksheet');
        }
      }
    })();
    //eslint-disable-next-line
  }, [name]);

  const worksheetCard = useMemo(() => {
    if (name !== undefined) {
      const card = worksheetCards.find((card) => card.key === name);
      if (card !== undefined) {
        return card;
      }
    }

    return null;
  }, [name]);

  if (name === undefined) {
    return <SelectWorksheet></SelectWorksheet>;
  }

  if (worksheet === null) return <SpinLayout></SpinLayout>;
  else {
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
              {worksheetCard?.title}
            </Typography.Text>
          </Space>
        </ResponsiveCont>
        <Worksheet worksheet={worksheet}></Worksheet>
      </Space>
    );
  }
}

function SelectWorksheet() {
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
          dataSource={worksheetCards}
          renderItem={(item: WorksheetCard) => (
            <List.Item>
              <Card
                title={
                  <Typography.Link href={`/worksheet/${item.key}`}>
                    {item.title}
                  </Typography.Link>
                }
              >
                <Typography.Text>{item.description}</Typography.Text>
              </Card>
            </List.Item>
          )}
        ></List>
      </Space>
    </ResponsiveCont>
  );
}

type WorksheetProps = {
  worksheet: WorksheetElem[];
};
function Worksheet({ worksheet }: WorksheetProps) {
  return (
    <Space
      direction="vertical"
      size={0}
      style={{
        width: '100%',
        marginTop: 30,
      }}
    >
      {worksheet.map((content, contentKey) => {
        switch (content.type) {
          case ContentType.Paragraph: {
            return (
              <ResponsiveCont key={contentKey}>
                <Space
                  direction="vertical"
                  size={20}
                  style={{
                    width: '100%',
                    marginBottom: 50,
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
              <div
                key={contentKey}
                style={{
                  marginBottom: 50,
                }}
              >
                <SegmentViewer
                  sheetKey={content.key}
                  title={content.title}
                  url={content.url}
                  oneStaff={content.oneStaff}
                ></SegmentViewer>
              </div>
            );
          }
          case ContentType.Image: {
            return (
              <ResponsiveCont key={contentKey}>
                <img alt={content.title} src={content.url}></img>
              </ResponsiveCont>
            );
          }
          default:
            return <div key={contentKey}></div>;
        }
      })}
    </Space>
  );
}

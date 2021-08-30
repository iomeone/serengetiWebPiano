import { Space, Typography } from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import SegmentViewer from 'components/SegmentViewer';
import SpinLayout from 'components/SpinLayout';
import { useEffect } from 'react';
import { useState } from 'react';

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
  url: string;
};

type WorksheetElem = Paragraph | Sheet | Image;

export default function WorksheetRoute() {
  const [worksheet, setWorksheet] = useState<WorksheetElem[] | null>(null);

  useEffect(() => {
    (async () => {
      const data = await fetch('worksheets/dragonSpine/data.json');
      const text = await data.text();
      setWorksheet(JSON.parse(text) as WorksheetElem[]);
    })();
  }, []);

  return (
    <Space
      direction="vertical"
      size={0}
      style={{
        width: '100%',
        marginTop: 30,
      }}
    >
      {worksheet === null && <SpinLayout></SpinLayout>}
      {worksheet !== null &&
        worksheet.map((content, contentKey) => {
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
                  <img src={content.url}></img>
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

import { Space, Typography } from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import SegmentViewer from 'components/SegmentViewer';

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

const worksheet: (Paragraph | Sheet)[] = [
  {
    type: ContentType.Paragraph,
    content: [
      ['무지성 피아노 배우기'],
      ['1단계: 오른손 연습', '오른손을 연습합니다.'],
    ],
  },
  {
    type: ContentType.Sheet,
    key: 'dragon-spine-right-hand',
    title: '드래곤 스파인: 오른손 연습',
    url: 'worksheets/dragonSpine/rightHand.musicxml',
    oneStaff: true,
  },
  {
    type: ContentType.Paragraph,
    content: [['2단계: 왼손 연습', '왼손을 연습하세요']],
  },
  {
    type: ContentType.Sheet,
    key: 'dragon-spine-left-hand',
    title: '드래곤 스파인: 왼손 연습',
    url: 'worksheets/dragonSpine/leftHand.musicxml',
    oneStaff: true,
  },
  {
    type: ContentType.Paragraph,
    content: [['3단계: 양손 연습', '양손을 연습하세요 ㅋㅋ']],
  },
  {
    type: ContentType.Sheet,
    key: 'dragon-spine-both-hands',
    title: '드래곤 스파인: 양손 연습',
    url: 'worksheets/dragonSpine/bothHands.musicxml',
    oneStaff: false,
  },
];

export default function WorksheetRoute() {
  return (
    <Space
      direction="vertical"
      size={0}
      style={{
        width: '100%',
        marginTop: 30,
      }}
    >
      {worksheet.map((content) => {
        switch (content.type) {
          case ContentType.Paragraph: {
            return (
              <ResponsiveCont>
                <Space
                  direction="vertical"
                  size={20}
                  style={{
                    width: '100%',
                    marginBottom: 50,
                  }}
                >
                  {content.content.map((lines) => (
                    <Space
                      direction="vertical"
                      size={8}
                      style={{
                        width: '100%',
                      }}
                    >
                      {lines.map((line) => (
                        <Typo>{line}</Typo>
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
          default:
            return <div></div>;
        }
      })}
    </Space>
  );
}

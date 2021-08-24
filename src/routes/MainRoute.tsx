import { Card, List, Space, Typography } from 'antd';
import styled from 'styled-components';
import { Size } from 'constants/layout';

const hMargin = Size.hMargin;
const margin = Size.margin;

const Main = styled.div`
  padding: ${margin}px ${hMargin}px ${margin}px ${hMargin}px;
`;

type RouteCard = {
  title: string;
  description: string;
  path: string;
};
const items: RouteCard[] = [
  {
    title: 'Sheet Music Viewer',
    path: '/sheet',
    description:
      'OpenSheetMusicDisplay를 이용한 악보 뷰어를 테스트합니다. MusicXML 악보 렌더링, 피아노 연주, 커서 이동, 자동 연주 기능 등을 개발하는 페이지입니다.',
  },
  {
    title: 'OSMD Component',
    path: '/osmd',
    description:
      'OpenSheetMusicDisplay를 이용하여 마크업 형식으로 저장되는 교육 자료에 삽입될 연습용 악보 컴포넌트를 개발 및 테스트합니다. 피아노 연주, 커서 이동, 자동 연주 기능 등이 적용됩니다.',
  },
  {
    title: 'MIDI',
    path: '/midi',
    description:
      'Web MIDI API를 이용하여 디지털 피아노와 컴퓨터를 직접 연결하고 MIDI 입력을 처리합니다. 키보드를 직접 연결하여 연주하고 현재 연주되는 음을 표시할 수 있습니다.',
  },
  {
    title: 'Piano Roll',
    path: '/pianoRoll',
    description:
      '음표와 쉼표를 띄우는 것이 아니라 음을 막대의 길이로 시간을 나타내는 방식을 사용하여 악보를 표시하는 악보 뷰어를 개발하고 테스트합니다.',
  },
  {
    title: 'Worksheet',
    path: '/worksheet',
    description:
      '글, 영상, 악보 등을 통해 사용자가 피아노를 학습할 수 있도록 하는 인터랙티브 E-book 콘텐츠를 표시하기 위한 포맷을 정하고, 이를 표시하는 기능을 개발 및 테스트합니다.',
  },
];

export default function MainRoute() {
  return (
    <Main>
      <Space
        direction="vertical"
        size={10}
        style={{
          width: '100%',
          maxWidth: 1000,
        }}
      >
        <List
          grid={{
            column: 2,
            gutter: 10,
          }}
          dataSource={items}
          renderItem={(item: RouteCard) => (
            <List.Item>
              <Card
                title={
                  <Typography.Link href={item.path}>
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
    </Main>
  );
}

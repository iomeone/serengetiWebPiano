import { Card, List, Space, Typography } from 'antd';
import styled from 'styled-components';

const margin = 20;

const Main = styled.div`
  padding: ${margin}px 50px ${margin}px 50px;
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

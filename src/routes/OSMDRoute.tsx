import { Typography } from 'antd';
import styled from 'styled-components';

const margin = 20;

const Main = styled.div`
  padding: ${margin}px 50px ${margin}px 50px;
`;

export default function OSMDRoute() {
  return (
    <Main>
      <Typography.Text>OSMD Component Test Page</Typography.Text>
    </Main>
  );
}

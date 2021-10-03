import { Button, Space } from 'antd';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import Viewer from 'components/Viewer';
import { setPianoVisibility } from 'modules/piano';
import LoadSheet from 'components/LoadSheet';
import { Size } from 'constants/layout';
import InteractivePiano from 'components/InteractivePiano';

const hMargin = Size.hMargin;
const margin = Size.margin;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${margin}px ${hMargin}px ${margin}px ${hMargin}px;
`;

const Title = styled.div`
  margin-bottom: ${margin}px;
`;

const sheetKey = 'osmd-sheet-key';

export default function SheetRoute() {
  const dispatch = useDispatch();

  return (
    <Main>
      <Title>
        <LoadSheet sheetKey={sheetKey}></LoadSheet>
      </Title>
      <Space direction="horizontal" size={8}>
        <Button
          onClick={() => {
            dispatch(setPianoVisibility(true));
          }}
        >
          피아노 열기
        </Button>
      </Space>
      <Viewer sheetKey={sheetKey}></Viewer>
      <InteractivePiano></InteractivePiano>
    </Main>
  );
}

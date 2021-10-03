import styled from 'styled-components';
import { Size } from 'constants/layout';
import AlignmentViewer from 'components/AlignmentViewer';
import LoadSheet from 'components/LoadSheet';
import { Space } from 'antd';

const hMargin = Size.hMargin;
const margin = Size.margin;

const Main = styled.div`
  padding: ${margin}px ${hMargin}px ${margin}px ${hMargin}px;
`;

const sheetKey = 'alignment-sheet-key';

export default function AlignmentRoute() {
  return (
    <Main>
      <Space
        size={20}
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        <LoadSheet sheetKey={sheetKey}></LoadSheet>
        <AlignmentViewer sheetKey={sheetKey}></AlignmentViewer>
      </Space>
    </Main>
  );
}

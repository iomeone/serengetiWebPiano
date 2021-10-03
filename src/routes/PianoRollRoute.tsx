import { Button, Space } from 'antd';
import styled from 'styled-components';
import LoadSheet from 'components/LoadSheet';
import { Size } from 'constants/layout';
import { useIntergratedPressedKeys } from 'hooks/useIntegratedPressedKeys';
import PianoRollModal from 'components/PianoRollModal';
import { useState } from 'react';
import Viewer from 'components/Viewer';

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

export default function PianoRollRoute() {
  const [loadModal, setLoadModal] = useState(false);
  const { initWithGesture } = useIntergratedPressedKeys();

  return (
    <Main>
      <PianoRollModal
        sheetKey={sheetKey}
        visible={loadModal}
        onVisibleChange={setLoadModal}
      />
      <Title>
        <LoadSheet sheetKey={sheetKey}></LoadSheet>
      </Title>
      <Space direction="horizontal" size={8}>
        <Button
          onClick={() => {
            initWithGesture();
            setLoadModal(true);
          }}
        >
          피아노 롤 열기
        </Button>
      </Space>
      <Viewer hidden={false} sheetKey={sheetKey}></Viewer>
    </Main>
  );
}

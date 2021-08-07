import { Typography } from 'antd';
import styled from 'styled-components';
import { Sheet } from 'models/Sheet';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { State } from 'modules/State';
import LoadSheetModal from 'components/LoadSheetModal';
import Viewer from 'components/Viewer';

const margin = 20;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${margin}px 50px ${margin}px 50px;
`;

const Title = styled.div`
  margin-bottom: ${margin}px;
`;

export default function SheetRoute() {
  const [loadModal, setLoadModal] = useState(false);
  const sheet = useSelector((state: State) => state.sheet);

  return (
    <Main>
      <LoadSheetModal
        visible={loadModal}
        onVisibleChange={setLoadModal}
      ></LoadSheetModal>
      <Title>
        {sheet.sheet === null ? (
          <Typography.Text>
            <Typography.Link
              onClick={() => {
                setLoadModal(true);
              }}
            >
              Press here
            </Typography.Link>{' '}
            to load new MusicXML file.
          </Typography.Text>
        ) : (
          <Typography.Text>
            Now Playing: {sheet.sheet.title}{' '}
            <Typography.Link
              onClick={() => {
                setLoadModal(true);
              }}
            >
              Reload
            </Typography.Link>
          </Typography.Text>
        )}
      </Title>
      <Viewer></Viewer>
    </Main>
  );
}

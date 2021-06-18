import { Layout, Space, Typography, Button, message } from 'antd';
import { Footer, Header } from 'antd/lib/layout/layout';
import styled from 'styled-components';
import { SettingOutlined } from '@ant-design/icons';
import { Sheet } from 'models/Sheet';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'modules/State';
import LoadSheetModal from 'components/LoadSheetModal';

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

const Screen = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const FooterCont = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
`;

const HeaderCont = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

function App() {
  const [loadModal, setLoadModal] = useState<boolean>(false);

  const sheet = useSelector((state: State) => state.sheet.sheet);
  const dispatch = useDispatch();

  return (
    <Screen>
      <LoadSheetModal
        visible={loadModal}
        onVisibleChange={(v: boolean) => {
          setLoadModal(v);
        }}
      ></LoadSheetModal>
      <Header>
        <HeaderCont>
          <Space size={8}>
            <Typography.Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 20,
              }}
            >
              Serengeti
            </Typography.Text>
            <Typography.Text
              style={{
                color: 'white',
                fontSize: 18,
              }}
            >
              | UGRP
            </Typography.Text>
          </Space>
          <Button shape="circle">
            <SettingOutlined />
          </Button>
        </HeaderCont>
      </Header>
      <Main>
        <Title>
          {sheet === null ? (
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
              Now Playing: {sheet.title}{' '}
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
      </Main>
      <Footer>
        <FooterCont>
          <Typography.Text style={{ textAlign: 'center' }}>
            copyright. 2021. sabana-music
          </Typography.Text>
        </FooterCont>
      </Footer>
    </Screen>
  );
}

export default App;

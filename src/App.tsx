import { Layout, Space, Typography } from "antd";
import { Footer, Header } from "antd/lib/layout/layout";
import styled from "styled-components";

const Main = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
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

function App() {
  return (
    <Screen>
      <Header>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space size={8}>
            <Typography.Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Serengeti
            </Typography.Text>
            <Typography.Text
              style={{
                color: "white",
                fontSize: 18,
              }}
            >
              | UGRP
            </Typography.Text>
          </Space>
        </div>
      </Header>
      <Main></Main>
      <Footer>
        <FooterCont>
          <Typography.Text style={{ textAlign: "center" }}>
            copyright. 2021. sabana-music
          </Typography.Text>
        </FooterCont>
      </Footer>
    </Screen>
  );
}

export default App;

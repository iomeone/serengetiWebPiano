import { Button, Space, Typography } from 'antd';
import Piano from 'components/Piano';
import SegmentViewer from 'components/SegmentViewer';
import { useIntergratedPressedKeys } from 'hooks/useIntegratedPressedKeys';
import { State } from 'modules/State';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { noteToMidiKeyNumber } from 'utils/Note';
import Tip from 'assets/tip.png';
import Title8 from 'assets/title8.png';

const Center = styled.div`
  display: flex;
  justify-content: center;
`;

const width = 1200;

const SpaceBetween = styled.div`
  width: ${width}px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const BackgroundBar = styled.div`
  position: absolute;
  width: 200vw;
  height: 400px;
  background-color: #ffc19166;
  left: 50vw;
  top: 220px;
  transform: translateX(-50%) translateY(-50%) rotate(-12deg);
  z-index: -1;
`;

export default function SampleWorksheetRoute() {
  const { initWithGesture, preloadWithGesture, isLoaded, pressedKeys } =
    useIntergratedPressedKeys();

  const piano = useSelector((state: State) => state.piano);

  return (
    <Space direction="vertical" size={60} style={{ width: '100%' }}>
      <Button
        disabled={isLoaded}
        onClick={() => {
          preloadWithGesture();
          initWithGesture();
        }}
      >
        Prepare Piano
      </Button>
      <Center>
        <img src={Title8}></img>
      </Center>
      <SegmentViewer
        sheetKey={'osmd-ptd-chorus-normal'}
        title="코러스: 노말 버전"
        oneStaff={false}
        url="/sheetData/permissionToDance/source2.musicxml"
      ></SegmentViewer>
      <Center>
        <SpaceBetween
          style={{
            position: 'relative',
          }}
        >
          <TipCard
            expand={false}
            title="연주 팁"
            text={[
              '오른손이 어려우면 노말 버전과 같이 솔# 한 음으로만 연주하세요.',
              '한 옥타브씩 치는 건 연습만이 살 길이에요.',
              '손을 자연스럽게 떨어뜨린다고 생각하시면 편해요.',
              '손 모양은 그대로 유지하고 엄지나 새끼손가락으로만 연주한다고 생각해 보면 다른 손가락은 자연스럽게 따라옵니다.',
              '아래 영상 참고하세요!',
            ]}
          ></TipCard>
          <span style={{ marginTop: 100 }}>
            <Youtube></Youtube>
          </span>
          <BackgroundBar></BackgroundBar>
        </SpaceBetween>
      </Center>
      <SegmentViewer
        sheetKey={'osmd-ptd-chorus-hard'}
        title="코러스: 하드 버전"
        oneStaff={false}
        url="/sheetData/permissionToDance/source1.musicxml"
      ></SegmentViewer>
      <Center>
        <SpaceBetween>
          <div></div>
          <TipCard
            type={TipCardType.Instruction}
            title="연습 순서"
            text={[
              '1. 코드 하나 하나 어떤 음표들을 눌러야 하는지 정확히 파악',
              '2. 정확하게 한 번에 짚는 연습부터 시작(도-솔-도 한번에 딱, 시-솔-시 한번에 딱)',
              '3. 다음 코드로 넘어갈 때 빠르게 짚는 연습(도-솔-도 다음 시-솔-시로 한번에 딱)',
              '4. 1~3번이 완벽히 될 때 리듬 연습',
            ]}
          ></TipCard>
        </SpaceBetween>
      </Center>
      <Piano
        pressedKeys={pressedKeys}
        lower={noteToMidiKeyNumber(piano.min)}
        upper={noteToMidiKeyNumber(piano.max)}
      />
    </Space>
  );
}

const YoutubeCont = styled.div`
  width: 680px;
  padding: 20px;
  border-radius: 8px;
  background-color: #eaffe3cc;
`;

function Youtube() {
  return (
    <YoutubeCont>
      <Space direction="vertical" size={10}>
        <Typography.Text
          style={{
            fontWeight: 'bold',
            fontSize: 18,
          }}
        >
          참고영상
        </Typography.Text>
        <iframe
          width={640}
          height={480}
          src="https://www.youtube.com/embed/E7wJTI-1dvQ"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="video"
        />
      </Space>
    </YoutubeCont>
  );
}

type TipCardContProps = {
  type: TipCardType;
  expand: boolean;
};

const TipCardCont = styled.div<TipCardContProps>`
  background-color: ${({ type }) => {
    switch (type) {
      case TipCardType.Instruction:
        return '#fff4e3cc';
      case TipCardType.Default:
      default:
        return '#ebf5feee';
    }
  }};
  border-radius: 8px;
  padding: 16px 20px 16px 20px;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 80px;
  width: ${({ expand }) => (expand ? '100%' : '460px')};
`;

enum TipCardType {
  Default,
  Instruction,
}

type TipCardProps = {
  title: string;
  text: string[];
  type?: TipCardType;
  expand?: boolean;
};
function TipCard({
  title,
  text,
  type = TipCardType.Default,
  expand = true,
}: TipCardProps) {
  return (
    <TipCardCont type={type} expand={expand}>
      <Space direction="vertical" size={10}>
        <Space direction="horizontal" size={20} align="center">
          <img width={20} src={Tip} />
          <Typography.Text
            style={{
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            {title}
          </Typography.Text>
        </Space>
        <div
          style={{
            marginLeft: 40,
            overflow: 'hidden',
          }}
        >
          <Space direction="vertical" size={8}>
            {text.map((str) => (
              <Typography.Text
                style={{
                  fontSize: 16,
                }}
              >
                {str}
              </Typography.Text>
            ))}
          </Space>
        </div>
      </Space>
    </TipCardCont>
  );
}

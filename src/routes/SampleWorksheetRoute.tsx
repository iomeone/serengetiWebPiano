import { Button, Divider, Space, Typography } from 'antd';
import Piano from 'components/Piano';
import SegmentViewer from 'components/SegmentViewer';
import { useIntergratedPressedKeys } from 'hooks/useIntegratedPressedKeys';
import { State } from 'modules/State';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { noteToMidiKeyNumber } from 'utils/Note';
import Tip from 'assets/tip.png';
import Tip2 from 'assets/tip2.png';
import Title8 from 'assets/title8.png';
import { NotoSansText } from 'components/NotoSansText';
import ResponsiveCont from 'components/ResponsiveCont';
import { ReactNode } from 'react';

const tipTitleSize = 24;
const tipTextSize = 18;
const textSize = 20;
const smallTitleSize = 28;
const titleSize = 43;

const Center = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
`;

const SpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export default function SampleWorksheetRoute() {
  const { initWithGesture, preloadWithGesture, isLoaded, pressedKeys } =
    useIntergratedPressedKeys();

  const piano = useSelector((state: State) => state.piano);

  return (
    <Space direction="vertical" size={100} style={{ width: '100%' }}>
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
      <ResponsiveCont>
        <TitleDivider title="코러스 파트 연습"></TitleDivider>
        <SmallTitle>이 파트에서는 무엇을 배우나요?</SmallTitle>
        <NotoSansText
          style={{
            fontSize: textSize,
          }}
        >
          이번 파트에서는 드디어 노래의 하이라이트인 코러스 부분을 연주합니다.
        </NotoSansText>
      </ResponsiveCont>
      <ResponsiveCont>
        <Space
          direction="vertical"
          size={8}
          style={{
            width: '100%',
          }}
        >
          <SegmentViewer
            sheetKey={'osmd-ptd-chorus-normal'}
            title="코러스: 노말 버전"
            oneStaff={false}
            url="/sheetData/permissionToDance/source2.musicxml"
          ></SegmentViewer>
          <TipCard
            type={TipCardType.Default}
            title="연습 순서"
            text={[
              '1. 코드 하나 하나 어떤 음표들을 눌러야 하는지 정확히 파악',
              '2. 정확하게 한 번에 짚는 연습부터 시작(도-솔-도 한번에 딱, 시-솔-시 한번에 딱)',
              '3. 다음 코드로 넘어갈 때 빠르게 짚는 연습(도-솔-도 다음 시-솔-시로 한번에 딱)',
              '4. 1~3번이 완벽히 될 때 리듬 연습',
            ]}
          ></TipCard>
        </Space>
      </ResponsiveCont>
      <ResponsiveCont>
        <TitleDivider title="오른손 연습"></TitleDivider>
        <SmallTitle>손가락 번호를 모르겠어요</SmallTitle>
        <Space direction="horizontal" size={40} align="start">
          <img src={Tip2}></img>
          <NotoSansText
            style={{
              fontSize: textSize,
            }}
          >
            처음 ‘미’ 를 <strong>중지(3번손가락)</strong>로 시작하면 연주하기
            훨씬 수월합니다.
            <br></br>붙임줄 주의 및 끝에 코드 정확히 짚는 연습을 해 보세요.
          </NotoSansText>
        </Space>
      </ResponsiveCont>
      <ResponsiveCont>
        <TitleDivider title="왼손 연습"></TitleDivider>
        <SpaceBetween>
          <Youtube></Youtube>
          <Space direction="vertical" size={20}>
            <TipCard
              expand={false}
              title="연주 팁"
              text={[
                '오른손이 어려우면 노말 버전과 같이 솔# 한 음으로만 연주하세요.',
              ]}
              type={TipCardType.Instruction}
            ></TipCard>
            <TipCard
              expand={false}
              title="한 옥타브 치기"
              text={[
                '한 옥타브씩 치는 건 연습만이 살 길이에요.',
                '손을 자연스럽게 떨어뜨린다고 생각하시면 편해요.',
                '손 모양은 그대로 유지하고 엄지나 새끼손가락으로만 연주한다고 생각해 보면 다른 손가락은 자연스럽게 따라옵니다.',
                '영상 참고하세요!',
              ]}
            ></TipCard>
          </Space>
        </SpaceBetween>
      </ResponsiveCont>
      <ResponsiveCont>
        <TitleDivider title="마장조 연습"></TitleDivider>
        <NotoSansText
          style={{
            width: 800,
            fontSize: textSize,
          }}
        >
          왼손 저 많은 음표들을 한꺼번에 치면서 멜로디까지 치려니까 정말 힘들
          거에요.<br></br>1절에서 연습했던 거랑 마찬가지로 너무 어렵다 싶으면
          <br></br>왼손과 오른손 동시에 치는 타이밍들을 파악해서 천천히
          연습하세요.
        </NotoSansText>
      </ResponsiveCont>
      <ResponsiveCont>
        <Space
          direction="vertical"
          size={8}
          style={{
            width: '100%',
          }}
        >
          <SegmentViewer
            sheetKey={'osmd-ptd-chorus-hard'}
            title="코러스: 하드 버전"
            oneStaff={false}
            url="/sheetData/permissionToDance/source1.musicxml"
          ></SegmentViewer>
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
        </Space>
      </ResponsiveCont>
      <Piano
        pressedKeys={pressedKeys}
        lower={noteToMidiKeyNumber(piano.min)}
        upper={noteToMidiKeyNumber(piano.max)}
      />
    </Space>
  );
}

const youtube = {
  w: 640 * 0.9,
  h: 480 * 0.9,
};

const YoutubeCont = styled.div`
  width: ${youtube.w + 40}px;
  padding: 20px;
  border-radius: 8px;
  background-color: #eaffe3cc;
`;

function Youtube() {
  return (
    <YoutubeCont>
      <Space direction="vertical" size={10}>
        <NotoSansText
          style={{
            fontWeight: 'bold',
            fontSize: textSize,
          }}
        >
          참고영상
        </NotoSansText>
        <iframe
          width={youtube.w}
          height={youtube.h}
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
  width: ${({ expand }) => (expand ? '100%' : '520px')};
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
          <NotoSansText
            style={{
              fontWeight: 'bold',
              fontSize: tipTitleSize,
            }}
          >
            {title}
          </NotoSansText>
        </Space>
        <div
          style={{
            marginLeft: 40,
            overflow: 'hidden',
          }}
        >
          <Space direction="vertical" size={8}>
            {text.map((str) => (
              <NotoSansText
                style={{
                  fontSize: tipTextSize,
                }}
              >
                {str}
              </NotoSansText>
            ))}
          </Space>
        </div>
      </Space>
    </TipCardCont>
  );
}

type TitleDividerProps = {
  title: string;
};

function TitleDivider({ title }: TitleDividerProps) {
  return (
    <Space
      direction="vertical"
      size={0}
      style={{
        width: '100%',
      }}
    >
      <NotoSansText
        style={{
          fontFamily: 'Black Han Sans',
          fontSize: titleSize,
        }}
      >
        {title}
      </NotoSansText>
      <Divider></Divider>
    </Space>
  );
}

type SmallTitleProps = {
  children: ReactNode;
};

function SmallTitle({ children }: SmallTitleProps) {
  return (
    <div>
      <span
        style={{
          fontFamily: 'Black Han Sans',
          fontSize: smallTitleSize,
        }}
      >
        {children}
      </span>
    </div>
  );
}

import { Size, WidthMode } from 'constants/layout';
import { useWidth } from 'hooks/useWidth';
import styled, { css } from 'styled-components';

const Cont = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  background: ${(props) => props.color};
`;

type InnerProps = { mode: WidthMode };

const Inner = styled.div<InnerProps>`
  ${(props) => {
    switch (props.mode) {
      case WidthMode.Desktop:
        return css`
          width: ${Size.maxWidth}px;
          height: 100%;
        `;
      case WidthMode.Tablet:
      case WidthMode.Mobile:
        return css`
          width: ${`calc(100% - ${2 * Size.hMargin}px)`};
          height: 100%;
        `;
    }
  }}
`;

export default function ResponsiveCont({ color, children }: Props) {
  const { widthMode } = useWidth();
  return (
    <Cont color={color ?? 'white'}>
      <Inner mode={widthMode}>{children}</Inner>
    </Cont>
  );
}

type Props = {
  color?: string;
  children: React.ReactNode;
};

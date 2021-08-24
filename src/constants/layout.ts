const MAX_WIDTH = 1200;
const MARGIN = 20;
const H_MARGIN = 50;

export const Size = {
  margin: MARGIN,
  hMargin: H_MARGIN,
  maxWidth: MAX_WIDTH,
  desktopMin: MAX_WIDTH + 2 * MARGIN,
  tabletMin: 724,
  headerHeight: 60,
};

export enum WidthMode {
  Desktop = 'Desktop',
  Tablet = 'Tablet',
  Mobile = 'Mobile',
}

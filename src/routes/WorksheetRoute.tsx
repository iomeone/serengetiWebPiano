import { Space, Typography } from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import { useWidth } from 'hooks/useWidth';

export default function WorksheetRoute() {
  const { widthMode } = useWidth();
  return (
    <Space
      direction="vertical"
      size={0}
      style={{
        width: '100%',
      }}
    >
      <ResponsiveCont>
        <Typography.Text>안녕하세요! {widthMode}</Typography.Text>
      </ResponsiveCont>
    </Space>
  );
}

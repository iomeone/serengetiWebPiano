import { Space, Typography } from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import { Size } from 'constants/layout';

const hMargin = Size.hMargin;

export default function EditorRoute() {
  return (
    <ResponsiveCont>
      <Space
        direction="vertical"
        size={10}
        style={{
          marginTop: hMargin,
        }}
      >
        <Typography.Text>Worksheet Editor</Typography.Text>
      </Space>
    </ResponsiveCont>
  );
}
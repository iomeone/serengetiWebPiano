import { Spin } from 'antd';

export default function SpinLayout() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        marginTop: 330,
      }}
    >
      <Spin size="large"></Spin>
    </div>
  );
}

import { Button, Modal, Typography } from 'antd';

type Props = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

export default function SettingsModal({ visible, onVisibleChange }: Props) {
  const handleCancel = () => {
    onVisibleChange(false);
  };

  const handleOk = () => {
    onVisibleChange(true);
  };

  const changed = false;

  return (
    <Modal
      title="Settings"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Return
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!changed}
          onClick={handleOk}
        >
          Apply
        </Button>,
      ]}
    >
      <Typography.Text>General Settings</Typography.Text>
    </Modal>
  );
}

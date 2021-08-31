import { EditOutlined } from '@ant-design/icons';
import { Button, Input, message, Space, Typography } from 'antd';
import { useEffect } from 'react';
import { useState } from 'react';
import Horizontal from './Horizontal';

type Props = {
  tag: string;
  title: string;
  onSubmit: (nextTitle: string) => void;
};

export default function TextEditor({ tag, title, onSubmit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [myTitle, setMyTitle] = useState('');

  useEffect(() => {
    if (title !== undefined) {
      setMyTitle(title);
    }
  }, [title]);

  const closeTitleChanger = () => {
    setIsEditing(false);
  };
  const prepareChangeTitle = () => {
    setIsEditing(true);
    setMyTitle(title ?? '');
  };
  const onMyTitleChange = (nextTitle: string) => {
    setMyTitle(nextTitle);
  };
  const submit = () => {
    if (title.length === 0) {
      message.error('제목을 입력해주세요.');
      return;
    }
    onSubmit(myTitle);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Horizontal>
        <Input
          value={myTitle}
          onChange={(e) => {
            onMyTitleChange(e.target.value);
          }}
          onPressEnter={() => {
            submit();
          }}
        ></Input>
        <Space
          direction="horizontal"
          size={6}
          style={{
            marginLeft: 6,
          }}
        >
          <Button
            type="primary"
            onClick={() => {
              submit();
            }}
          >
            변경
          </Button>
          <Button
            type="primary"
            onClick={() => {
              closeTitleChanger();
            }}
          >
            닫기
          </Button>
        </Space>
      </Horizontal>
    );
  } else {
    return (
      <Space direction="horizontal" size={6}>
        <Typography.Text
          style={{
            fontWeight: 'bold',
          }}
        >
          {tag} |{' '}
        </Typography.Text>
        <Typography.Text>{myTitle}</Typography.Text>
        <Button
          type="text"
          shape="circle"
          onClick={() => {
            prepareChangeTitle();
          }}
        >
          <EditOutlined></EditOutlined>
        </Button>
      </Space>
    );
  }
}

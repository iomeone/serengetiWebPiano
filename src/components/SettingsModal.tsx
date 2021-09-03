import { getAuth, User } from 'firebase/auth';
import { Button, Modal, Slider, Checkbox, Space, Typography, Spin } from 'antd';
import produce from 'immer';
import { setPianoRange, setPianoVisibility } from 'modules/piano';
import { State } from 'modules/State';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, signOut } from 'utils/Auth';
import {
  diatonicNumberToNote,
  diatonicNumberToNoteName,
  Note,
  noteToDiatonicNumber,
  parseNoteNameToDiatonicNumber,
} from 'utils/Note';
import { useAuthState } from 'react-firebase-hooks/auth';

type Props = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

type GeneralOption = {
  piano: PianoOption;
};

type PianoOption = {
  visibility: boolean;
  range: [Note, Note];
};

const useSettings = () => {
  const [option, setOption] = useState<GeneralOption | null>(null);
  const visibility = useSelector((state: State) => state.piano.visibility);
  const max = useSelector((state: State) => state.piano.max);
  const min = useSelector((state: State) => state.piano.min);
  useEffect(() => {
    setOption({
      piano: {
        visibility,
        range: [min, max],
      },
    });
  }, [visibility, max, min]);

  return option;
};

const diatonicNumberFormatter = (diatonicNumber?: number): string => {
  if (diatonicNumber === undefined) {
    return '';
  }
  return diatonicNumberToNoteName(diatonicNumber);
};

export default function SettingsModal({ visible, onVisibleChange }: Props) {
  const option = useSettings();
  const [newOption, setNewOption] = useState<GeneralOption | null>(null);
  const [changed, setChanged] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setNewOption(option);
    setChanged(false);
  }, [visible, option]);

  useEffect(() => {
    setNewOption(option);
    setChanged(false);
  }, [option]);

  const handleOption = (nextOption: GeneralOption) => {
    setNewOption(nextOption);
    setChanged(true);
  };

  const handleCancel = () => {
    onVisibleChange(false);
  };

  const handleOk = (nextOption: GeneralOption) => {
    dispatchOption(nextOption);
    setChanged(false);
    onVisibleChange(false);
  };

  const dispatchOption = (nextOption: GeneralOption) => {
    dispatch(setPianoVisibility(nextOption.piano.visibility));
    dispatch(setPianoRange(nextOption.piano.range));
  };

  if (option === null || newOption === null) return <div></div>;

  return (
    <Modal
      title={
        <Typography.Text
          style={{
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          General Option
        </Typography.Text>
      }
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Return
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!changed}
          onClick={() => {
            handleOk(newOption);
          }}
        >
          Apply
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <LoginArea></LoginArea>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Typography.Text
            style={{
              fontWeight: 'bold',
            }}
          >
            Piano Option
          </Typography.Text>
          <Space size={4}>
            <Checkbox
              checked={newOption.piano.visibility}
              onChange={(e) => {
                handleOption(
                  produce(newOption, (draft) => {
                    draft.piano.visibility = e.target.checked;
                  }),
                );
              }}
            ></Checkbox>
            <Typography.Text>Show Piano</Typography.Text>
          </Space>
          <Typography.Text>Piano Render Range</Typography.Text>
          <Slider
            range
            min={parseNoteNameToDiatonicNumber('A0')}
            max={parseNoteNameToDiatonicNumber('C8')}
            tipFormatter={diatonicNumberFormatter}
            value={
              newOption.piano.range.map((note) =>
                noteToDiatonicNumber(note),
              ) as [number, number]
            }
            onChange={(keyNumbers) => {
              handleOption(
                produce(newOption, (draft) => {
                  draft.piano.range = keyNumbers.map((num) =>
                    diatonicNumberToNote(num),
                  ) as [Note, Note];
                }),
              );
            }}
          />
        </Space>
      </Space>
    </Modal>
  );
}

function LoginArea() {
  const [user, loading]: [User | null, boolean, any] = useAuthState(getAuth());

  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Typography.Text
        style={{
          fontWeight: 'bold',
        }}
      >
        Login
      </Typography.Text>
      {(() => {
        if (loading) {
          return <Spin></Spin>;
        }
        if (user !== null) {
          return (
            <Space direction="vertical" size={8}>
              <Typography.Text>{user.displayName}</Typography.Text>
              <Button
                onClick={() => {
                  signOut();
                }}
              >
                로그아웃
              </Button>
            </Space>
          );
        } else {
          return (
            <Button
              onClick={() => {
                signIn();
              }}
            >
              구글 로그인
            </Button>
          );
        }
      })()}
    </Space>
  );
}

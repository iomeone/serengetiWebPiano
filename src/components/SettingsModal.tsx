import { getAuth, User } from 'firebase/auth';
import { Button, Modal, Slider, Checkbox, Space, Typography, Spin } from 'antd';
import produce from 'immer';
import { setPianoRange, setPianoVisibility, setVolume } from 'modules/piano';
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
import { MonitorMode } from 'models/SimilarityMonitor';
import {
  numberToSimilarityMonitorMode,
  similarityMonitorModeToNumber,
  similarityMonitorModeToStr,
} from 'utils/SimilarityMonitor';
import {
  setSensitivity,
  setSimilarityMonitorMode,
  setTurningThreshold,
} from 'modules/alignment';

type Props = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

type GeneralOption = {
  piano: PianoOption;
  alignment: AlignmentOption;
};

type PianoOption = {
  visibility: boolean;
  range: [Note, Note];
  volume: number;
};

type AlignmentOption = {
  monitorMode: MonitorMode;
  sensitivity: number;
  turningThreshold: number;
};

const useSettings = () => {
  const [option, setOption] = useState<GeneralOption | null>(null);
  const visibility = useSelector((state: State) => state.piano.visibility);
  const max = useSelector((state: State) => state.piano.max);
  const min = useSelector((state: State) => state.piano.min);
  const volume = useSelector((state: State) => state.piano.volume);

  const monitorMode = useSelector(
    (state: State) => state.alignment.similarityMonitorMode,
  );
  const sensitivity = useSelector(
    (state: State) => state.alignment.sensitivity,
  );
  const turningThreshold = useSelector(
    (state: State) => state.alignment.turningThreshold,
  );

  useEffect(() => {
    setOption({
      piano: {
        visibility,
        range: [min, max],
        volume,
      },
      alignment: {
        monitorMode,
        sensitivity,
        turningThreshold,
      },
    });
  }, [
    visibility,
    max,
    min,
    volume,
    monitorMode,
    sensitivity,
    turningThreshold,
  ]);

  return option;
};

const diatonicNumberFormatter = (diatonicNumber?: number): string => {
  if (diatonicNumber === undefined) {
    return '';
  }
  return diatonicNumberToNoteName(diatonicNumber);
};

const similarityMonitorModeFormatter = (modeNum?: number): string => {
  if (modeNum === undefined) {
    return '';
  }
  return similarityMonitorModeToStr(numberToSimilarityMonitorMode(modeNum));
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
    dispatch(setVolume(nextOption.piano.volume));
    dispatch(setSimilarityMonitorMode(nextOption.alignment.monitorMode));
    dispatch(setSensitivity(nextOption.alignment.sensitivity));
    dispatch(setTurningThreshold(nextOption.alignment.turningThreshold));
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
        <Typography.Text>Piano MIDI Volume</Typography.Text>
        <Slider
          min={0}
          max={1}
          value={newOption.piano.volume}
          onChange={(volume) => {
            handleOption(
              produce(newOption, (draft) => {
                draft.piano.volume = volume;
              }),
            );
          }}
        />
        <Typography.Text
          style={{
            fontWeight: 'bold',
          }}
        >
          Alignment Option
        </Typography.Text>
        <Typography.Text>Similarity Monitor</Typography.Text>
        <Slider
          min={similarityMonitorModeToNumber(MonitorMode.Disable)}
          max={similarityMonitorModeToNumber(MonitorMode.Opaque)}
          tipFormatter={similarityMonitorModeFormatter}
          value={similarityMonitorModeToNumber(newOption.alignment.monitorMode)}
          onChange={(modeNum) => {
            handleOption(
              produce(newOption, (draft) => {
                draft.alignment.monitorMode =
                  numberToSimilarityMonitorMode(modeNum);
              }),
            );
          }}
        />
        <Typography.Text>Sensitivity</Typography.Text>
        <Slider
          min={0.1}
          max={1.5}
          step={0.01}
          value={newOption.alignment.sensitivity}
          onChange={(sensitivity) => {
            handleOption(
              produce(newOption, (draft) => {
                draft.alignment.sensitivity = sensitivity;
              }),
            );
          }}
        />
        <Typography.Text>Turning Threshold</Typography.Text>
        <Slider
          min={0.4}
          max={0.9}
          step={0.01}
          value={newOption.alignment.turningThreshold}
          onChange={(turningThreshold) => {
            handleOption(
              produce(newOption, (draft) => {
                draft.alignment.turningThreshold = turningThreshold;
              }),
            );
          }}
        />
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

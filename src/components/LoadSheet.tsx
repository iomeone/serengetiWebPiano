import { Typography } from 'antd';
import { Sheet } from 'models/Sheet';
import { loadSheetThunk, loadTestSheetThunk } from 'modules/audio';
import { State } from 'modules/State';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadSheetModal from './LoadSheetModal';

type LoadSheetProps = {
  sheetKey: string;
};

export default function LoadSheet({ sheetKey }: LoadSheetProps) {
  const [loadModal, setLoadModal] = useState(false);
  const dispatch = useDispatch();
  const sheet = useSelector(
    (state: State) => (state.audio.sheets[sheetKey] ?? null) as Sheet | null,
  );
  const loaded = useMemo(() => sheet !== null && sheet.loaded, [sheet]);

  return (
    <>
      <LoadSheetModal
        onLoadFile={(file) => {
          dispatch(loadSheetThunk(sheetKey, file.originFileObj as File));
        }}
        visible={loadModal}
        onVisibleChange={setLoadModal}
      ></LoadSheetModal>
      <Typography.Text>
        {loaded ? (
          <Typography.Text>
            Now Playing: {sheet?.title}{' '}
            <Typography.Link
              onClick={() => {
                setLoadModal(true);
              }}
            >
              Reload
            </Typography.Link>
          </Typography.Text>
        ) : (
          <Typography.Text>
            <Typography.Link
              onClick={() => {
                setLoadModal(true);
              }}
            >
              Press here
            </Typography.Link>{' '}
            to load new MusicXML file.{' '}
            <Typography.Link
              onClick={() => {
                dispatch(loadTestSheetThunk(sheetKey));
              }}
            >
              OR Just Use Test data
            </Typography.Link>
          </Typography.Text>
        )}
      </Typography.Text>
    </>
  );
}

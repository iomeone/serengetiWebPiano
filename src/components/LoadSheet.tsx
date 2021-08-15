import { Typography } from 'antd';
import { loadTestSheetThunk } from 'modules/sheet';
import { State } from 'modules/State';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadSheetModal from './LoadSheetModal';

export default function LoadSheet() {
  const [loadModal, setLoadModal] = useState(false);
  const dispatch = useDispatch();
  const sheet = useSelector((state: State) => state.sheet);

  return (
    <>
      <LoadSheetModal
        visible={loadModal}
        onVisibleChange={setLoadModal}
      ></LoadSheetModal>
      <Typography.Text>
        {sheet.sheet === null ? (
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
                dispatch(loadTestSheetThunk());
              }}
            >
              OR Just Use Test data
            </Typography.Link>
          </Typography.Text>
        ) : (
          <Typography.Text>
            Now Playing: {sheet.sheet.title}{' '}
            <Typography.Link
              onClick={() => {
                setLoadModal(true);
              }}
            >
              Reload
            </Typography.Link>
          </Typography.Text>
        )}
      </Typography.Text>
    </>
  );
}

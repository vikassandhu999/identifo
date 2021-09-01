import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import EditIcon from '~/components/icons/EditIcon';
import LoadingIcon from '~/components/icons/LoadingIcon';
import Button from '~/components/shared/Button';
import SectionHeader from '~/components/shared/SectionHeader';
import { resetError } from '~/modules/database/actions';
import Form from './Form';
import Preview from './Preview';

const StorageSettings = (props) => {
  const {
    title, description, settings,
    progress, connectionState, postSettings, verifySettings } = props;
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);

  const handleEditCancel = () => {
    dispatch(resetError());
    setEditing(false);
  };

  const handlePostClick = async (data) => {
    postSettings(data);
  };

  const handleVerifyClick = (data) => {
    verifySettings(data);
  };

  return (
    <div className="iap-settings-section">
      <SectionHeader
        title={title}
        description={description}
      />
      <main>
        {editing && (
          <Form
            posting={!!progress}
            connectionStatus={connectionState}
            settings={settings}
            onSubmit={handlePostClick}
            onCancel={handleEditCancel}
            onVerify={handleVerifyClick}
          />
        )}
        {!editing && (
          <>
            <Preview fetching={progress} settings={settings} />
            <Button
              disabled={progress}
              Icon={progress ? LoadingIcon : EditIcon}
              onClick={() => setEditing(true)}
            >
              {`Edit ${title}`}
            </Button>
          </>
        )}
      </main>
    </div>
  );
};

export default StorageSettings;

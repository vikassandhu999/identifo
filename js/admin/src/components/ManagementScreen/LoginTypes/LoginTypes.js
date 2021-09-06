import React, { useEffect } from 'react';
import update from '@madappgang/update-by-path';
import { useDispatch, useSelector } from 'react-redux';
import { updateLoginSettings } from '~/modules/settings/actions';
import LoginTypesTable from './LoginTypesTable';
import Field from '~/components/shared/Field';
import { Select, Option } from '~/components/shared/Select';
import useProgressBar from '~/hooks/useProgressBar';
import { getLoginSettings } from '~/modules/settings/selectors';

const LoginTypesSection = () => {
  const dispatch = useDispatch();
  const settings = useSelector(getLoginSettings);
  const { setProgress } = useProgressBar();

  useEffect(() => {
    // TODO: Nikita K removee this uef
    setProgress(100);
  }, []);

  const handleChange = (type, enabled) => {
    const nextSettings = update(settings, `loginWith.${type}`, enabled);
    dispatch(updateLoginSettings(nextSettings));
  };

  const handleTfaTypeChange = (value) => {
    const nextSettings = update(settings, { tfaType: value });
    dispatch(updateLoginSettings(nextSettings));
  };

  return (
    <section className="iap-management-section">
      <p className="iap-management-section__title">
        Login Types
      </p>

      <p className="iap-management-section__description">
        These settings allow to turn off undesirable login endpoints.
      </p>

      <div className="iap-settings-section">
        <div className="section-field">
          <Field label="2FA Type">
            <Select
              value={settings.tfaType}
              onChange={handleTfaTypeChange}
              placeholder="Select 2FA Type"
            >
              <Option value="app" title="App" />
              <Option value="sms" title="SMS" />
              <Option value="email" title="Email" />
            </Select>
          </Field>
        </div>
        <LoginTypesTable types={settings.loginWith} onChange={handleChange} />
      </div>

    </section>
  );
};

export default LoginTypesSection;

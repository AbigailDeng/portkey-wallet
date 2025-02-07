import { WalletError } from '@portkey-wallet/store/wallet/type';
import { Button, Form, FormProps, message } from 'antd';
import { FormItem } from 'components/BaseAntd';
import CustomPassword from 'components/CustomPassword';
import CustomSvg from 'components/CustomSvg';
import InternalMessage from 'messages/InternalMessage';
import InternalMessageTypes from 'messages/InternalMessageTypes';
import { ReactNode, useCallback, useState } from 'react';
import { setPasswordSeed } from 'store/reducers/user/slice';
import { useDispatch } from 'react-redux';
import './index.less';
import { useTranslation } from 'react-i18next';
import aes from '@portkey-wallet/utils/aes';
import { sleep } from '@portkey-wallet/utils';
import { getWalletState } from 'utils/lib/SWGetReduxStore';

interface LockPageProps extends FormProps {
  onUnLockHandler?: (pwd: string) => void;
  header?: ReactNode;
}

export default function LockPage({ header, onUnLockHandler, ...props }: LockPageProps) {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const [isPassword, setIsPassword] = useState<-1 | 0 | 1>(-1);
  const dispatch = useDispatch();
  const onFinish = useCallback(
    async (values: any) => {
      const { password } = values;
      setIsPassword(-1);
      const wallet = await getWalletState();

      if (!wallet.walletInfo) return message.error(WalletError.noCreateWallet);

      const privateKey = aes.decrypt(wallet.walletInfo.AESEncryptPrivateKey, password);
      if (privateKey) {
        setIsPassword(1);
        dispatch(setPasswordSeed(password));
        InternalMessage.payload(InternalMessageTypes.SET_SEED, password).send();
        await sleep(100);
        onUnLockHandler?.(password);
      } else {
        setIsPassword(0);
      }
    },
    [dispatch, onUnLockHandler],
  );

  return (
    <>
      <div className="lock-page-wrapper">
        {header ? (
          header
        ) : (
          <div className="lock-page-header">
            <CustomSvg type="PortKey" />
          </div>
        )}
        <div className="lock-page-content">
          <div className="logo-wrapper">
            <CustomSvg type="PortKey" />
            <h1>{t('Welcome back!')}</h1>
          </div>
          <Form
            {...props}
            className="unlock-form"
            onValuesChange={(v) => {
              if ('password' in v) {
                if (!v.password) return setIsPassword(0);
                setIsPassword(-1);
              }
            }}
            form={form}
            name="unlock"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off">
            <FormItem
              className="customer-password"
              label={t('Enter Pin')}
              name="password"
              validateStatus={isPassword === 0 ? 'error' : undefined}
              help={isPassword === 0 ? t('Incorrect pin') : undefined}
              validateTrigger={false}>
              <CustomPassword className="custom-password" placeholder={t('Enter Pin')} />
            </FormItem>

            <FormItem shouldUpdate>
              {() => (
                <Button
                  className="submit-btn"
                  type="primary"
                  htmlType="submit"
                  disabled={
                    // !form.isFieldsTouched(true) || !!form.getFieldsError().filter(({ errors }) => errors.length).length
                    !form.isFieldsTouched(true) || isPassword === 0
                  }>
                  {t('Unlock')}
                </Button>
              )}
            </FormItem>
          </Form>
        </div>
      </div>
    </>
  );
}

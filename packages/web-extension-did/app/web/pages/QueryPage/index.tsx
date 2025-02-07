/**
 * @file
 * Query registration and login data
 */
import { useCurrentWalletInfo } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { message } from 'antd';
import InternalMessage from 'messages/InternalMessage';
import InternalMessageTypes from 'messages/InternalMessageTypes';
import LockPage from 'pages/components/LockPage';
import RegisterHeader from 'pages/components/RegisterHeader';
import { useCallback } from 'react';
import { useEffectOnce } from 'react-use';
import { useLoading } from 'store/Provider/hooks';
import useFetchDidWallet from 'hooks/useFetchDidWallet';

export default function QueryPage() {
  const { setLoading } = useLoading();
  const fetchWalletResult = useFetchDidWallet();
  const currentWalletInfo = useCurrentWalletInfo();

  const fetchCreateWalletResult = useCallback(
    async (pwd: string) => {
      try {
        if (!currentWalletInfo.managerInfo) throw 'Missing managerInfo';
        await fetchWalletResult({
          pwd,
          clientId: currentWalletInfo.address,
          requestId: currentWalletInfo.managerInfo.requestId || '',
          verificationType: currentWalletInfo.managerInfo.verificationType,
          managerUniqueId: currentWalletInfo.managerInfo.managerUniqueId,
          managerAddress: currentWalletInfo.address,
        });
      } catch (error: any) {
        setLoading(false);
        console.log(error, 'fetch error===');
        message.error(error);
      }
      setLoading(false);
    },
    [currentWalletInfo, setLoading, fetchWalletResult],
  );

  useEffectOnce(() => {
    setLoading(0.5);
    InternalMessage.payload(InternalMessageTypes.GET_SEED)
      .send()
      .then((res): any => {
        if (!res?.data?.privateKey) return setLoading(false);
        fetchCreateWalletResult(res.data.privateKey);
      });
  });

  const onUnLockHandler = useCallback(
    async (pwd: string) => {
      // get CA address
      setLoading(0.5);
      await fetchCreateWalletResult(pwd);
    },
    [fetchCreateWalletResult, setLoading],
  );

  return (
    <div className="query-page-wrapper">
      <LockPage header={<RegisterHeader />} onUnLockHandler={onUnLockHandler} />
    </div>
  );
}

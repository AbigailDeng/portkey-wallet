import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDeviceList } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { MenuItemInfo } from 'pages/components/MenuList';
import { BaseHeaderProps } from 'types/UI';
import WalletSecurityPrompt from './Prompt';
import WalletSecurityPopup from './Popup';
import { useCommonState, useDapp, useWalletInfo } from 'store/Provider/hooks';

export interface IWalletSecurityProps extends BaseHeaderProps {
  menuList: MenuItemInfo[];
}

export default function WalletSecurity() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isNotLessThan768 } = useCommonState();
  const { deviceAmount } = useDeviceList();
  const { currentNetwork } = useWalletInfo();
  const { dappMap } = useDapp();
  const currentDapp = useMemo(() => dappMap[currentNetwork] || [], [currentNetwork, dappMap]);

  const MenuListData: MenuItemInfo[] = useMemo(
    () => [
      {
        key: t('Login Devices'),
        element: (
          <div className="flex manage-device">
            <span>{t('Login Devices')}</span>
            <span className="number">{deviceAmount}</span>
          </div>
        ),
        click: () => {
          navigate('/setting/wallet-security/manage-devices');
        },
      },
      {
        key: t('Connected Sites'),
        element: (
          <div className="flex connected-sites">
            <span>{t('Connected Sites')}</span>
            <span className="number">{currentDapp.length}</span>
          </div>
        ),
        click: () => {
          navigate('/setting/wallet-security/connected-sites');
        },
      },
    ],
    [currentDapp?.length, deviceAmount, navigate, t],
  );

  const title = t('Wallet Security');
  const goBack = useCallback(() => navigate('/setting'), [navigate]);

  return isNotLessThan768 ? (
    <WalletSecurityPrompt headerTitle={title} menuList={MenuListData} />
  ) : (
    <WalletSecurityPopup headerTitle={title} menuList={MenuListData} goBack={goBack} />
  );
}

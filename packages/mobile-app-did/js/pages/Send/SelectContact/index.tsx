import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import CommonTopTab from 'components/CommonTopTab';
import GStyles from 'assets/theme/GStyles';
import { defaultColors } from 'assets/theme';
import { pTd } from 'utils/unit';
import { useLanguage } from 'i18n/hooks';
import { FlashList } from '@shopify/flash-list';
import RecentContactItem from 'pages/Send/components/RecentContactItem';
import { ContactItemType, RecentContactItemType } from '@portkey-wallet/types/types-ca/contact';

// import RecentList from '../components/RecentList';
import ContactsList from 'components/ContactList';
import NoData from 'components/NoData';
import { TextS } from 'components/CommonText';
import { useAppCommonDispatch } from '@portkey-wallet/hooks';
import useEffectOnce from 'hooks/useEffectOnce';
import { fetchContactListAsync } from '@portkey-wallet/store/store-ca/contact/actions';
import { useContact } from '@portkey-wallet/hooks/hooks-ca/contact';
import { ChainId } from '@portkey-wallet/types';
import { useCaAddressInfoList, useCurrentWallet } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { useRecent } from '@portkey-wallet/hooks/hooks-ca/useRecent';
import { fetchRecentListAsync } from '@portkey-wallet/store/store-ca/recent/slice';
import MyAddressItem from '../components/MyAddressItem';

interface SelectContactProps {
  chainId: ChainId;
  onPress?: (contact: any) => void;
}

export default function SelectContact(props: SelectContactProps) {
  const { chainId, onPress } = props;

  const { t } = useLanguage();
  const dispatch = useAppCommonDispatch();
  const { contactIndexList } = useContact();
  const { walletInfo } = useCurrentWallet();
  const caAddressInfos = useCaAddressInfoList();

  const caAddress = useMemo(() => walletInfo?.[chainId]?.caAddress || '', [chainId, walletInfo]);

  const { recentContactList, totalRecordCount } = useRecent(caAddress || '');

  const renderItem = useCallback(
    ({ item }: { item: RecentContactItemType }) => {
      return <RecentContactItem contact={item} onPress={onPress} />;
    },
    [onPress],
  );

  const isExistContact = useMemo<boolean>(
    () => contactIndexList.reduce((pv, cv) => pv + cv.contacts.length, 0) > 0,
    [contactIndexList],
  );

  const myOtherAddressList = useMemo(() => {
    return caAddressInfos.filter(item => item.chainId !== chainId);
  }, [caAddressInfos, chainId]);

  const loadMore = useCallback(() => {
    dispatch(
      fetchRecentListAsync({
        caAddress: caAddress,
        caAddressInfos: caAddressInfos.filter(item => item.chainId === chainId),
        isFirstTime: false,
      }),
    );
  }, [caAddress, caAddressInfos, chainId, dispatch]);

  const init = useCallback(() => {
    dispatch(
      fetchRecentListAsync({
        caAddress: caAddress,
        caAddressInfos: caAddressInfos.filter(item => item.chainId === chainId),
        isFirstTime: true,
      }),
    );
    dispatch(fetchContactListAsync());
  }, [caAddress, caAddressInfos, chainId, dispatch]);

  useEffectOnce(() => {
    init();
  });

  const tabList = useMemo(() => {
    return [
      {
        name: t('Recents'),
        tabItemDom: (
          <View style={styles.recentListWrap}>
            <FlashList
              data={recentContactList || []}
              renderItem={renderItem}
              ListFooterComponent={
                <TextS style={styles.footer}>{recentContactList?.length === 0 ? '' : t('No More Data')}</TextS>
              }
              ListEmptyComponent={<NoData noPic message={t('There is no recents.')} />}
              onEndReached={() => {
                if (recentContactList.length >= totalRecordCount) return;
                loadMore();
              }}
            />
          </View>
        ),
      },
      {
        name: t('Contacts'),
        tabItemDom: !isExistContact ? (
          <NoData noPic message={t('There is no contacts.')} />
        ) : (
          <ContactsList
            isReadOnly
            style={styles.contactWrap}
            isIndexBarShow={false}
            isSearchShow={false}
            renderContactItem={(item: ContactItemType) => (
              <RecentContactItem isContacts={true} contact={item as RecentContactItemType} onPress={onPress} />
            )}
            ListFooterComponent={<View style={styles.footer} />}
          />
        ),
      },
      {
        name: t('My address'),
        tabItemDom: (
          <View style={styles.recentListWrap}>
            <FlashList
              data={myOtherAddressList || []}
              renderItem={({ item }) => (
                <MyAddressItem chainId={item.chainId} address={item.caAddress} onPress={onPress} />
              )}
              ListEmptyComponent={<NoData noPic message={t('There is no other chain addresses.')} />}
            />
          </View>
        ),
      },
    ];
  }, [isExistContact, loadMore, myOtherAddressList, onPress, recentContactList, renderItem, t, totalRecordCount]);

  return <CommonTopTab tabList={tabList} />;
}

const styles = StyleSheet.create({
  inputWrap: {
    backgroundColor: defaultColors.bg5,
    ...GStyles.paddingArg(0, 16, 16),
  },
  flatList: {
    backgroundColor: defaultColors.bg1,
  },
  noResult: {
    backgroundColor: defaultColors.bg1,
    color: defaultColors.font7,
    flex: 1,
    textAlign: 'center',
    fontSize: pTd(14),
    paddingTop: pTd(41),
  },
  recentListWrap: {
    flex: 1,
    backgroundColor: defaultColors.bg1,
  },
  item: {
    height: 20,
  },
  contactWrap: {
    backgroundColor: defaultColors.bg1,
  },
  footer: {
    marginTop: pTd(22),
    width: '100%',
    textAlign: 'center',
    color: defaultColors.font7,
    marginBottom: pTd(100),
  },
});

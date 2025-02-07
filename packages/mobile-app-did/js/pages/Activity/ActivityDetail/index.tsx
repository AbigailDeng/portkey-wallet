import { ELF_DECIMAL, TransactionTypes } from '@portkey-wallet/constants/constants-ca/activity';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { useCaAddresses, useCurrentWallet } from '@portkey-wallet/hooks/hooks-ca/wallet';
import useRouterParams from '@portkey-wallet/hooks/useRouterParams';
import { fetchActivity } from '@portkey-wallet/store/store-ca/activity/api';
import { ActivityItemType, TransactionStatus } from '@portkey-wallet/types/types-ca/activity';
import { addressFormat, formatChainInfoToShow, getExploreLink } from '@portkey-wallet/utils';
import { divDecimals, formatAmountShow } from '@portkey-wallet/utils/converter';
import { Image } from '@rneui/base';
import { defaultColors } from 'assets/theme';
import fonts from 'assets/theme/fonts';
import GStyles from 'assets/theme/GStyles';
import { FontStyles } from 'assets/theme/styles';
import CommonButton from 'components/CommonButton';
import { TextL, TextM, TextS } from 'components/CommonText';
import CommonToast from 'components/CommonToast';
import PageContainer from 'components/PageContainer';
import Svg from 'components/Svg';
import * as Clipboard from 'expo-clipboard';
import useEffectOnce from 'hooks/useEffectOnce';
import { useLanguage } from 'i18n/hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatTransferTime } from 'utils';
import { formatStr2EllipsisStr } from '@portkey-wallet/utils';
import navigationService from 'utils/navigationService';
import { pTd } from 'utils/unit';
import { useIsTestnet } from '@portkey-wallet/hooks/hooks-ca/network';
import { SHOW_FROM_TRANSACTION_TYPES } from '@portkey-wallet/constants/constants-ca/activity';
import { useIsTokenHasPrice, useGetCurrentAccountTokenPrice } from '@portkey-wallet/hooks/hooks-ca/useTokensPrice';

const ActivityDetail = () => {
  const { t } = useLanguage();
  const activityItemFromRoute = useRouterParams<ActivityItemType>();
  const { transactionId = '', blockHash = '', isReceived: isReceivedParams } = activityItemFromRoute;
  const caAddresses = useCaAddresses();
  const isTestnet = useIsTestnet();
  const isTokenHasPrice = useIsTokenHasPrice(activityItemFromRoute?.symbol);
  const [tokenPriceObject, getTokenPrice] = useGetCurrentAccountTokenPrice();
  const { currentNetwork } = useCurrentWallet();

  const [activityItem, setActivityItem] = useState<ActivityItemType>();

  const { explorerUrl } = useCurrentChain(activityItem?.fromChainId) ?? {};

  useEffectOnce(() => {
    const params = {
      caAddresses,
      transactionId,
      blockHash,
    };
    fetchActivity(params)
      .then(res => {
        if (isReceivedParams !== undefined) {
          res.isReceived = isReceivedParams;
        }
        setActivityItem(res);
      })
      .catch(error => {
        throw Error(JSON.stringify(error));
      });
  });

  const isNft = useMemo(() => !!activityItem?.nftInfo?.nftId, [activityItem?.nftInfo?.nftId]);
  const status = useMemo(() => {
    if (!activityItem?.status) return { text: '', style: 'confirmed' };

    if (activityItem?.status === TransactionStatus.Mined)
      return {
        text: 'Confirmed',
        style: 'confirmed',
      };
    return {
      text: 'Failed',
      style: 'failed',
    };
  }, [activityItem]);

  const copyStr = useCallback(
    async (str: string) => {
      const isCopy = await Clipboard.setStringAsync(str);
      isCopy && CommonToast.success(t('Copy Success'));
    },
    [t],
  );

  const CopyIconUI = useCallback(
    (content: string) => (
      <TouchableOpacity
        style={[styles.marginLeft8, GStyles.flexCol, styles.copyIconWrap]}
        onPress={() => copyStr(content)}>
        <Svg icon="copy" size={pTd(13)} />
      </TouchableOpacity>
    ),
    [copyStr],
  );

  const networkUI = useMemo(() => {
    const { transactionType, fromChainId, toChainId, transactionId: _transactionId = '' } = activityItem || {};

    const isNetworkShow = transactionType && SHOW_FROM_TRANSACTION_TYPES.includes(transactionType);
    return (
      <>
        <View style={styles.section}>
          {isNetworkShow && (
            <View style={[styles.flexSpaceBetween]}>
              <TextM style={[styles.lightGrayFontColor]}>{t('Network')}</TextM>
              <View style={styles.networkInfoContent}>
                <TextM style={[styles.blackFontColor]}>{formatChainInfoToShow(fromChainId, currentNetwork)}</TextM>
                <View style={GStyles.flexRowWrap}>
                  <TextM style={[styles.lightGrayFontColor]}>{` → `}</TextM>
                  <TextM style={[styles.blackFontColor]}>{formatChainInfoToShow(toChainId, currentNetwork)}</TextM>
                </View>
              </View>
            </View>
          )}
          <View style={[styles.flexSpaceBetween, isNetworkShow && styles.marginTop16]}>
            <TextM style={[styles.lightGrayFontColor]}>{t('Transaction ID')}</TextM>
            <View style={GStyles.flex1} />
            <View style={[GStyles.flexRowWrap, styles.alignItemsEnd]}>
              <TextM>{formatStr2EllipsisStr(_transactionId, 10, 'tail')}</TextM>
            </View>
            {CopyIconUI(transactionId)}
          </View>
        </View>
        <Text style={[styles.divider, styles.marginTop0]} />
      </>
    );
  }, [CopyIconUI, activityItem, currentNetwork, t, transactionId]);

  const feeUI = useMemo(() => {
    const transactionFees =
      activityItem?.transactionFees?.length === 0
        ? [{ fee: 0, symbol: 'ELF', feeInUsd: 0 }]
        : activityItem?.transactionFees || [];

    return (
      <View style={styles.section}>
        <View style={[styles.flexSpaceBetween]}>
          <TextM style={[styles.blackFontColor, styles.fontBold]}>{t('Transaction Fee')}</TextM>
          {activityItem?.isDelegated ? (
            <View style={[styles.transactionFeeItemWrap]}>
              <TextM style={[styles.blackFontColor, styles.fontBold]}>{`0 ELF`}</TextM>
              {!isTestnet && (
                <TextS style={[styles.lightGrayFontColor, styles.marginTop4]}>{`$ ${formatAmountShow(0, 2)}`}</TextS>
              )}
            </View>
          ) : (
            <View>
              {transactionFees.map((item, index) => (
                <View key={index} style={[styles.transactionFeeItemWrap, index > 0 && styles.marginTop8]}>
                  <TextM style={[styles.blackFontColor, styles.fontBold]}>{`${formatAmountShow(
                    divDecimals(item?.fee ?? 0, ELF_DECIMAL),
                  )} ${item.symbol}`}</TextM>
                  {!isTestnet && (
                    <TextS style={[styles.lightGrayFontColor, styles.marginTop4]}>{`$ ${formatAmountShow(
                      item?.feeInUsd ?? 0,
                      2,
                    )}`}</TextS>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }, [activityItem?.isDelegated, activityItem?.transactionFees, isTestnet, t]);

  useEffectOnce(() => {
    getTokenPrice(activityItem?.symbol);
  });

  return (
    <PageContainer
      hideHeader
      safeAreaColor={['white']}
      containerStyles={styles.containerStyle}
      scrollViewProps={{ disabled: true }}>
      <StatusBar barStyle={'dark-content'} />
      <TouchableOpacity style={styles.closeWrap} onPress={() => navigationService.goBack()}>
        <Svg icon="close" size={pTd(16)} />
      </TouchableOpacity>
      <Text style={[styles.typeTitle]}>{activityItem?.transactionName}</Text>

      {activityItem?.transactionType &&
        SHOW_FROM_TRANSACTION_TYPES.includes(activityItem?.transactionType) &&
        (isNft ? (
          <>
            <View style={styles.topWrap}>
              {activityItem?.nftInfo?.imageUrl ? (
                <Image resizeMode={'contain'} style={styles.img} source={{ uri: activityItem?.nftInfo?.imageUrl }} />
              ) : (
                <Text style={styles.noImg}>{activityItem?.nftInfo?.alias?.slice(0, 1)}</Text>
              )}
              <View style={styles.nftInfo}>
                <TextL style={styles.nftTitle}>{`${activityItem?.nftInfo?.alias || ''} #${
                  activityItem?.nftInfo?.nftId || ''
                }`}</TextL>
                <TextS style={[FontStyles.font3, styles.marginTop4]}>Amount: {activityItem?.amount || ''}</TextS>
              </View>
            </View>
            <View style={styles.divider} />
          </>
        ) : (
          <>
            <Text style={[styles.tokenCount, styles.fontBold]}>
              {SHOW_FROM_TRANSACTION_TYPES.includes(activityItem?.transactionType as TransactionTypes) &&
                (activityItem?.isReceived ? '+' : '-')}
              {`${formatAmountShow(divDecimals(activityItem?.amount, activityItem?.decimals))} ${
                activityItem?.symbol || ''
              }`}
            </Text>
            {!isTestnet && isTokenHasPrice && (
              <Text style={styles.usdtCount}>{`$ ${formatAmountShow(
                divDecimals(activityItem?.amount, activityItem?.decimals).multipliedBy(
                  tokenPriceObject[activityItem.symbol],
                ),
                2,
              )}`}</Text>
            )}
          </>
        ))}
      <View style={[styles.flexSpaceBetween, styles.titles1]}>
        <TextM style={styles.lightGrayFontColor}>{t('Status')}</TextM>
        <TextM style={styles.lightGrayFontColor}>{t('Date')}</TextM>
      </View>
      <View style={[styles.flexSpaceBetween, styles.values1]}>
        <TextM style={styles.greenFontColor}>{t(status.text)}</TextM>
        <TextM style={styles.blackFontColor}>
          {activityItem && activityItem.timestamp ? formatTransferTime(Number(activityItem?.timestamp) * 1000) : ''}
        </TextM>
      </View>
      <View style={styles.card}>
        {/* From */}
        {activityItem?.transactionType && SHOW_FROM_TRANSACTION_TYPES.includes(activityItem?.transactionType) && (
          <>
            <View style={styles.section}>
              <View style={[GStyles.flexRowWrap]}>
                <TextM style={styles.lightGrayFontColor}>{t('From')}</TextM>
                <View style={GStyles.flex1} />
                <View style={[styles.alignItemsEnd, styles.justifyContentCenter]}>
                  {activityItem?.from && <TextM style={styles.blackFontColor}>{activityItem.from}</TextM>}
                  <TextS style={styles.lightGrayFontColor}>
                    {formatStr2EllipsisStr(addressFormat(activityItem?.fromAddress, activityItem?.fromChainId))}
                  </TextS>
                </View>
                {CopyIconUI(addressFormat(activityItem?.fromAddress, activityItem?.fromChainId) || '')}
              </View>
            </View>
            <Text style={[styles.divider, styles.marginTop0]} />
          </>
        )}
        {/* To */}
        {activityItem?.transactionType && SHOW_FROM_TRANSACTION_TYPES.includes(activityItem?.transactionType) && (
          <>
            <View style={styles.section}>
              <View style={[GStyles.flexRowWrap]}>
                <TextM style={[styles.lightGrayFontColor]}>{t('To')}</TextM>
                <View style={GStyles.flex1} />
                <View style={[styles.alignItemsEnd, styles.justifyContentCenter]}>
                  {activityItem?.to && <TextM style={[styles.blackFontColor]}>{activityItem?.to}</TextM>}
                  <TextS style={[styles.lightGrayFontColor]}>
                    {formatStr2EllipsisStr(addressFormat(activityItem?.toAddress, activityItem?.toChainId))}
                  </TextS>
                </View>
                {CopyIconUI(addressFormat(activityItem?.toAddress, activityItem?.toChainId) || '')}
              </View>
            </View>
            <Text style={[styles.divider, styles.marginTop0]} />
          </>
        )}

        {/* more Info */}

        {networkUI}
        {/* transaction Fee */}
        {feeUI}
      </View>
      <View style={styles.space} />
      {explorerUrl && (
        <CommonButton
          containerStyle={[GStyles.marginTop(8), styles.bottomButton]}
          onPress={() => {
            if (!activityItem?.transactionId) return;

            navigationService.navigate('ViewOnWebView', {
              title: t('View on Explorer'),
              url: getExploreLink(explorerUrl, activityItem?.transactionId || '', 'transaction'),
            });
          }}
          title={t('View on Explorer')}
          type="clear"
          style={styles.button}
          buttonStyle={styles.bottomButton}
        />
      )}
    </PageContainer>
  );
};

export default ActivityDetail;

export const styles = StyleSheet.create({
  containerStyle: {
    paddingLeft: pTd(20),
    paddingRight: pTd(20),
    paddingTop: pTd(16),
    display: 'flex',
    alignItems: 'center',
  },
  closeWrap: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  typeIcon: {
    marginTop: pTd(32),
  },
  typeTitle: {
    marginTop: pTd(5),
    marginBottom: pTd(40),
    color: defaultColors.font5,
    fontSize: pTd(20),
    lineHeight: pTd(24),
  },
  tokenCount: {
    fontSize: pTd(28),
    ...fonts.mediumFont,
    color: defaultColors.font5,
  },
  usdtCount: {
    marginTop: pTd(4),
    fontSize: pTd(14),
  },
  topWrap: {
    width: '100%',
    marginTop: pTd(40),
    display: 'flex',
    flexDirection: 'row',
    minWidth: '100%',
  },
  img: {
    width: pTd(64),
    height: pTd(64),
    borderRadius: pTd(6),
    marginRight: pTd(16),
  },
  noImg: {
    overflow: 'hidden',
    width: pTd(64),
    height: pTd(64),
    borderRadius: pTd(6),
    backgroundColor: defaultColors.bg7,
    fontSize: pTd(54),
    lineHeight: pTd(64),
    textAlign: 'center',
    color: defaultColors.font7,
    marginRight: pTd(16),
  },
  topLeft: {
    ...GStyles.flexCol,
    justifyContent: 'center',
  },
  nftInfo: {
    display: 'flex',
    justifyContent: 'center',
  },
  nftTitle: {
    ...fonts.mediumFont,
    color: defaultColors.font5,
    marginBottom: pTd(4),
    flexDirection: 'row',
    display: 'flex',
    flexWrap: 'wrap',
  },
  flexSpaceBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: pTd(20),
    width: '100%',
  },
  titles1: {
    marginTop: pTd(24),
  },
  values1: {
    marginTop: pTd(4),
  },
  divider: {
    marginTop: pTd(24),
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: defaultColors.border1,
  },
  titles2: {
    marginTop: pTd(25),
  },
  values2: {
    marginTop: pTd(4),
  },
  card: {
    marginTop: pTd(24),
    borderRadius: pTd(6),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: defaultColors.border1,
    width: '100%',
  },
  section: {
    ...GStyles.paddingArg(16, 12),
  },
  marginTop16: {
    marginTop: pTd(16),
  },
  marginTop8: {
    marginTop: pTd(8),
  },
  marginTop4: {
    marginTop: pTd(4),
  },
  marginTop0: {
    marginTop: 0,
  },
  marginLeft8: {
    marginLeft: pTd(8),
  },
  space: {
    flex: 1,
  },
  button: {
    marginBottom: pTd(30),
  },
  lightGrayFontColor: {
    color: defaultColors.font3,
  },
  blackFontColor: {
    color: defaultColors.font5,
  },
  fontBold: {
    ...fonts.mediumFont,
  },
  greenFontColor: {
    color: defaultColors.font10,
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  alignItemsEnd: {
    alignItems: 'flex-end',
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  bottomButton: {
    backgroundColor: defaultColors.bg1,
  },
  networkInfoContent: {
    flexDirection: 'row',
    flexShrink: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginLeft: pTd(20),
  },
  transactionFeeItemWrap: {
    alignItems: 'flex-end',
  },
  copyIconWrap: {
    justifyContent: 'flex-end',
    // backgroundColor: 'red',
    paddingBottom: pTd(3),
  },
});

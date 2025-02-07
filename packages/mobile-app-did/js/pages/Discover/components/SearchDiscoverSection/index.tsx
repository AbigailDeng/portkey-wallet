import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import GStyles from 'assets/theme/GStyles';
import { useLanguage } from 'i18n/hooks';
import { TextM, TextS } from 'components/CommonText';
import { pTd } from 'utils/unit';
import fonts from 'assets/theme/fonts';
import NoData from 'components/NoData';
import { FontStyles } from 'assets/theme/styles';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import { defaultColors } from 'assets/theme';
import { DiscoverItem } from '@portkey-wallet/store/store-ca/cms/types';
import DiscoverWebsiteImage from '../DiscoverWebsiteImage';
import { useDiscoverJumpWithNetWork } from 'hooks/discover';
interface ISearchDiscoverSectionProps {
  searchedDiscoverList: DiscoverItem[];
}

export default function SearchDiscoverSection(props: ISearchDiscoverSectionProps) {
  const { t } = useLanguage();
  const { searchedDiscoverList } = props;
  const { s3Url } = useCurrentNetworkInfo();
  const jumpToWebview = useDiscoverJumpWithNetWork();

  const onJump = (i: DiscoverItem) => {
    jumpToWebview({
      item: {
        id: Date.now(),
        name: i.title,
        url: i?.url ?? i?.description,
      },
    });
  };

  if (searchedDiscoverList.length === 0) return <NoData noPic message={t('There is no search result.')} />;

  return (
    <ScrollView style={styles.sectionWrap}>
      {searchedDiscoverList?.map((item, index) => (
        <TouchableOpacity key={index} style={itemStyle.wrap} onPress={() => onJump(item)}>
          <DiscoverWebsiteImage imageUrl={`${s3Url}/${item?.imgUrl?.filename_disk}`} size={pTd(32)} />
          <View style={itemStyle.right}>
            <View style={itemStyle.infoWrap}>
              <TextM numberOfLines={1} ellipsizeMode={'tail'} style={itemStyle.gameName}>
                {item?.title}
              </TextM>
              <TextS numberOfLines={1} ellipsizeMode={'tail'} style={[FontStyles.font3, itemStyle.gameInfo]}>
                {item?.description}
              </TextS>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    ...GStyles.paddingArg(0, 20),
  },
  headerWrap: {
    height: pTd(22),
  },
  header: {
    ...fonts.mediumFont,
    lineHeight: pTd(24),
  },
  cancelButton: {
    paddingLeft: pTd(12),
    lineHeight: pTd(36),
  },
});

const itemStyle = StyleSheet.create({
  wrap: {
    height: pTd(80),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  right: {
    height: pTd(80),
    marginLeft: pTd(16),
    paddingRight: pTd(16),
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: defaultColors.border6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  image: {
    width: pTd(32),
    height: pTd(32),
    borderRadius: pTd(16),
  },
  infoWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  gameName: {
    lineHeight: pTd(22),
  },
  gameInfo: {
    lineHeight: pTd(16),
    marginTop: pTd(2),
  },
});

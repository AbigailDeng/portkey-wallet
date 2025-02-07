import React from 'react';
import OverlayModal from 'components/OverlayModal';
import { Keyboard, View, ViewProps } from 'react-native';
import { StyleSheet, ViewStyle } from 'react-native';
import { screenWidth } from '@portkey-wallet/utils/mobile/device';
import { pTd } from 'utils/unit';
import { defaultColors } from 'assets/theme';
import { TextXL } from 'components/CommonText';
import Svg from 'components/Svg';
import GStyles from 'assets/theme/GStyles';
import fonts from 'assets/theme/fonts';
import { useGStyles } from 'assets/theme/useGStyles';
import ButtonRow from 'components/ButtonRow';
import { CommonButtonProps } from 'components/CommonButton';

export interface ModalBodyProps extends ViewProps {
  title?: string;
  modalBodyType?: 'center' | 'bottom';
  style?: ViewStyle;
  onClose?: () => void;
  bottomButtonGroup?: {
    onPress?: () => void;
    type?: CommonButtonProps['type'];
    title: string;
    loading?: CommonButtonProps['loading'];
    disabled?: boolean;
  }[];
}

export const ModalBody: React.FC<ModalBodyProps> = props => {
  const { modalBodyType, title, children, style = {}, onClose, bottomButtonGroup } = props;

  const gStyles = useGStyles();

  if (modalBodyType === 'bottom') {
    return (
      <View style={[styles.commonBox, gStyles.overlayStyle, styles.wrapStyle, style]}>
        <View style={styles.topWrap}>
          <TextXL suppressHighlighting={true} style={[styles.titleStyle, fonts.mediumFont]} onPress={Keyboard.dismiss}>
            {title}
          </TextXL>
          <View
            style={styles.closeIcon}
            pointerEvents="box-only"
            onTouchStart={() => {
              onClose?.();
              Keyboard.dismiss();
              OverlayModal.hide();
            }}>
            <Svg icon="close" size={pTd(12)} />
          </View>
        </View>
        {children}
        {!!bottomButtonGroup && (
          <ButtonRow
            style={styles.buttonGroup}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitleStyle}
            buttons={bottomButtonGroup}
          />
        )}
      </View>
    );
  }

  return <View style={[styles.commonBox, styles.centerBox, style]}>{children}</View>;
};

export const styles = StyleSheet.create({
  commonBox: {
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  wrapStyle: {
    width: screenWidth,
  },
  centerBox: {
    width: screenWidth * 0.85,
  },
  topWrap: {
    position: 'relative',
    paddingTop: pTd(16),
    paddingBottom: pTd(16),
  },
  titleStyle: {
    lineHeight: pTd(22),
    width: '100%',
    textAlign: 'center',
  },
  closeIcon: {
    ...GStyles.paddingArg(21, 20),
    position: 'absolute',
    right: 0,
  },
  headerRow: {
    paddingTop: pTd(14),
    paddingBottom: pTd(7),
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: defaultColors.border6,
  },
  headerIcon: {
    height: pTd(5),
    borderRadius: pTd(3),
    backgroundColor: defaultColors.bg7,
    width: pTd(48),
  },
  buttonGroup: {
    backgroundColor: defaultColors.bg1,
    position: 'absolute',
    bottom: 0,
    paddingRight: pTd(20),
    ...GStyles.paddingArg(10, 20, 16, 20),
  },
  buttonStyle: {
    height: pTd(48),
    fontSize: pTd(18),
  },
  buttonTitleStyle: {
    fontSize: pTd(16),
  },
});

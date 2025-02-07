import { ZERO } from '@portkey-wallet/constants/misc';
import { UserGuardianItem } from '@portkey-wallet/store/store-ca/guardians/type';
import { GuardiansInfo } from '@portkey-wallet/types/types-ca/guardian';
import { LoginType } from '@portkey-wallet/types/types-ca/wallet';
import { VerifierItem } from '@portkey-wallet/types/verifier';
const APPROVAL_COUNT = ZERO.plus(3).div(5);
import BigNumber from 'bignumber.js';

export function getApprovalCount(length: number) {
  if (length <= 3) return length;
  return APPROVAL_COUNT.times(length).dp(0, BigNumber.ROUND_DOWN).plus(1).toNumber();
}

export function handleVerificationDoc(verificationDoc: string) {
  const [type, guardianIdentifier, verificationTime, verifierAddress, salt] = verificationDoc.split(',');
  return { type, guardianIdentifier, verificationTime, verifierAddress, salt };
}

export function handleUserGuardiansList(
  holderInfo: GuardiansInfo,
  verifierServers: VerifierItem[] | { [key: string]: VerifierItem },
) {
  const { guardianList } = holderInfo;
  return guardianList.guardians.map(item => {
    return {
      ...item,
      guardianAccount: item.guardianIdentifier || item.identifierHash,
      guardianType: LoginType[item.type as any],
      key: `${item.guardianIdentifier}&${item.verifierId}`,
      verifier: Array.isArray(verifierServers)
        ? verifierServers.find(verifierItem => verifierItem.id === item.verifierId)
        : verifierServers[item.verifierId],
      isLoginAccount: item.isLoginGuardian,
    };
  });
}

export function checkIsLastLoginAccount(guardiansList: UserGuardianItem[], guardian: UserGuardianItem) {
  const loginIndex = guardiansList.findIndex(
    item =>
      item.isLoginAccount &&
      !(
        item.guardianType === guardian.guardianType &&
        item.guardianAccount === guardian.guardianAccount &&
        item.verifier?.id === guardian.verifier?.id
      ),
  );
  return loginIndex === -1;
}

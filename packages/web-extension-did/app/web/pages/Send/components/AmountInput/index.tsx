import { BaseToken } from '@portkey-wallet/types/types-ca/token';
import NftInput from './NftInput';
import TokenInput from './TokenInput';

export default function AmountInput({
  fromAccount,
  type = 'token',
  toAccount,
  value,
  token,
  errorMsg,
  onChange,
  getTranslationInfo,
}: {
  fromAccount: { address: string; AESEncryptPrivateKey: string };
  type: 'token' | 'nft';
  toAccount: { address: string };
  value: string;
  token: BaseToken;
  errorMsg: string;
  onChange: (params: { amount: string; balance: string }) => void;
  getTranslationInfo: (v: string) => void;
}) {
  return type === 'token' ? (
    <TokenInput
      fromAccount={fromAccount}
      toAccount={toAccount}
      value={value}
      token={token}
      errorMsg={errorMsg}
      onChange={onChange}
      getTranslationInfo={getTranslationInfo}
    />
  ) : (
    <NftInput fromAccount={fromAccount} value={value} token={token} errorMsg={errorMsg} onChange={onChange} />
  );
}

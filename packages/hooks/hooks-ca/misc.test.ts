import { MiscState } from '../../../test/data/miscState';
import { renderHookWithProvider } from '../../../test/utils/render';
import { setupStore } from '../../../test/utils/setup';
import { useMisc, useSetLocalPhoneCountryCode } from './misc';
import { useAppCommonDispatch } from '../index';
import { renderHook } from '@testing-library/react';
import { CountryItem } from '@portkey-wallet/types/types-ca/country';
import * as MiscActions from '@portkey-wallet/store/store-ca/misc/actions';

jest.mock('../index', () => ({
  useAppCommonDispatch: jest.fn(),
}));

describe('useMisc', () => {
  test('get misc data successfully', () => {
    const { result } = renderHookWithProvider(useMisc, setupStore(MiscState));

    expect(result.current).toHaveProperty('phoneCountryCodeListChainMap');
    expect(result.current).toHaveProperty('defaultPhoneCountryCode');
    expect(result.current.defaultPhoneCountryCode).toEqual(MiscState.misc.defaultPhoneCountryCode);
  });
  test('failed to get misc data', () => {
    const { result } = renderHookWithProvider(useMisc, setupStore({}));

    expect(result.current).toBeUndefined();
  });
});

describe('useSetLocalPhoneCountryCode', () => {
  it('should call useAppCommonDispatch with setLocalPhoneCountryCodeAction when called', () => {
    const dispatchMock = jest.fn();
    const countryItemMock: CountryItem = { country: 'US', code: '+1', iso: 'US' };

    (useAppCommonDispatch as jest.Mock).mockReturnValue(dispatchMock);
    jest.spyOn(MiscActions, 'setLocalPhoneCountryCodeAction').mockImplementation(jest.fn());

    const { result } = renderHook(() => useSetLocalPhoneCountryCode());
    const setLocalPhoneCountryCode = result.current;

    setLocalPhoneCountryCode(countryItemMock);

    expect(useAppCommonDispatch).toHaveBeenCalled();
    expect(MiscActions.setLocalPhoneCountryCodeAction).toHaveBeenCalled();
  });
});

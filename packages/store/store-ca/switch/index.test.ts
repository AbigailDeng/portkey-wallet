import { fetchIsShowBuyFeatureAsync, switchSlice } from './slice';
import { configureStore } from '@reduxjs/toolkit';
import { request } from '@portkey-wallet/api/api-did';

jest.mock('@portkey-wallet/api/api-did');
const reducer = switchSlice.reducer;
describe('fetchIsShowBuyFeatureAsync', () => {
  const store = configureStore({ reducer });
  test('fetch show Buy Feature', async () => {
    jest.mocked(request.switch.checkButtonBuy).mockResolvedValueOnce({ isOpen: true });
    await store.dispatch(fetchIsShowBuyFeatureAsync());
    expect(store.getState().isShowBuyFeature).toBe(true);
  });

  test('fetch hide Buy Feature', async () => {
    jest.mocked(request.switch.checkButtonBuy).mockResolvedValueOnce({ isOpen: false });
    await store.dispatch(fetchIsShowBuyFeatureAsync());
    expect(store.getState().isShowBuyFeature).toBe(false);
  });
});

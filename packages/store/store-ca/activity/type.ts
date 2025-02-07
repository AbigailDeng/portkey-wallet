import { ActivityItemType, the2ThFailedActivityItemType } from '@portkey-wallet/types/types-ca/activity';
import { TransactionTypes } from '@portkey-wallet/constants/constants-ca/activity';
import { ICaAddressInfoListItemType } from '@portkey-wallet/hooks/hooks-ca/wallet';

export type ActivityStateType = {
  activityMap: ActivityStateMap;
  isFetchingActivities: boolean;
  failedActivityMap: { [transactionId: string]: the2ThFailedActivityItemType };
  isLoading?: boolean;
};

export type ActivityStateMap = {
  [key: string]: ActivityStateMapAttributes;
};

export type ActivityStateMapAttributes = {
  maxResultCount: number;
  skipCount: number;
  data: ActivityItemType[];
  totalRecordCount: number;
  chainId?: string;
  symbol?: string;
};

export interface IActivitiesApiParams {
  maxResultCount: number;
  skipCount: number;
  caAddresses?: string[];
  caAddressInfos?: { chainId: string; caAddress: string }[];
  managerAddresses?: string[];
  transactionTypes?: TransactionTypes[];
  chainId?: string;
  symbol?: string;
  width?: number;
  height?: number;
}

export interface IActivitiesApiResponse {
  data: ActivityItemType[];
  totalRecordCount: number;
}

export interface IActivityApiParams {
  transactionId: string;
  blockHash: string;
  caAddresses?: string[];
}

export interface IActivityListWithAddressApiParams {
  maxResultCount: number;
  skipCount: number;
  caAddressInfos: ICaAddressInfoListItemType[];
  targetAddressInfos: ICaAddressInfoListItemType[];
}

import { NetworkType } from '@portkey-wallet/types';
import { getApolloClient } from './apollo';

import {
  SocialMediaCustomDocument,
  SocialMediaCustomQuery,
  SocialMediaCustomQueryVariables,
} from './__generated__/hooks/socialMediaCustom';
import {
  TabMenuCustomDocument,
  TabMenuCustomQuery,
  TabMenuCustomQueryVariables,
} from './__generated__/hooks/tabMenuCustom';
import {
  DiscoverGroupDocument,
  DiscoverGroupQuery,
  DiscoverGroupQueryVariables,
} from './__generated__/hooks/discoverGroupCustom';

// SocialMedia
const getSocialMedia = async (network: NetworkType, params: SocialMediaCustomQueryVariables) => {
  const apolloClient = getApolloClient(network);
  const result = await apolloClient.query<SocialMediaCustomQuery>({
    query: SocialMediaCustomDocument,
    variables: params,
  });
  return result;
};

// TabMenu
const getTabMenu = async (network: NetworkType, params: TabMenuCustomQueryVariables) => {
  const apolloClient = getApolloClient(network);
  const result = await apolloClient.query<TabMenuCustomQuery>({
    query: TabMenuCustomDocument,
    variables: params,
  });
  return result;
};

const getDiscoverGroup = async (network: NetworkType, params: DiscoverGroupQueryVariables) => {
  const apolloClient = getApolloClient(network);
  const result = await apolloClient.query<DiscoverGroupQuery>({
    query: DiscoverGroupDocument,
    variables: params,
  });
  return result;
};

export { getSocialMedia, getTabMenu, getDiscoverGroup };

interface HelperNetworkConfig {
  [key: string]: {
    blockConfirmations: number
  }
}

export const helperNetworkConfig: HelperNetworkConfig = {
  localhost: {
    blockConfirmations: 1
  },
  hardhat: {
    blockConfirmations: 1
  },
  rinkeby: {
    blockConfirmations: 6
  }
};

export const INITIAL_SUPPLY = '1000000000000000000000';

export const developmentChains = ['hardhat', 'localhost'];

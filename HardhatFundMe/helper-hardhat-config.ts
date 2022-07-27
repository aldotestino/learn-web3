interface NetworkConfig {
  [key: string]: {
    chainId: number,
    ethUsdPriceFeed: string,
    blockConfirmations: number
  }
}

export const networkConfig: NetworkConfig = {
  rinkeby: {
    chainId: 4,
    ethUsdPriceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
    blockConfirmations: 6
  }
};

export const developmentChains = ['hardhat', 'localhost'];

export const DECIMALS = 8;
export const INITIAL_ANSWER = 200000000000;
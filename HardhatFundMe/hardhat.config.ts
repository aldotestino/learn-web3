import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-etherscan';
import 'solidity-coverage';
import 'hardhat-deploy';
import 'dotenv/config';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat', // -> non necessita di PRIVATE_KET e RPC_URL
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 4
    }
  },
  solidity: {
    compilers: [{ version: '0.8.9', }, { version: '0.6.6' }]
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: false,
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  }
};

export default config;

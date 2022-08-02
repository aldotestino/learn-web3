import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';
import './tasks/block-number';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat', // -> non necessita di PRIVATE_KET e RPC_URL
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 4
    }
  },
  solidity: '0.8.9',
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
  }
};

export default config;

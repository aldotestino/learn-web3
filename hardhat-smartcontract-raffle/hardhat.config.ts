import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-deploy';
import 'solidity-coverage';
import 'hardhat-gas-reporter';
import 'hardhat-contract-sizer';
import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    rinkeby: {
      chainId: 4,
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!]
    }
  },
  gasReporter: {
    enabled: false
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: '0.8.8',
  namedAccounts: {
    deployer: {
      default: 0
    },
    player: {
      default: 1
    }
  },
  mocha: {
    timeout: 300000
  }
};

export default config;
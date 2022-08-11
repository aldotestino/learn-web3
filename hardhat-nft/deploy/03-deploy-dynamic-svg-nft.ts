import { network } from 'hardhat';
import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { developmentChains, helperNetworkConfig } from '../helper-hardhat-config';
import verify from '../utils/verify';
import * as fs from 'fs';

const deployNft: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  let ethUsdPriceFeedAddress: string;

  if (developmentChains.includes(network.name)) {
    const { address } = await get('MockV3Aggregator');
    ethUsdPriceFeedAddress = address;
  } else {
    ethUsdPriceFeedAddress = helperNetworkConfig[network.name].ethUsdPriceFeed;
  }

  const lowSvg = await fs.readFileSync('./images/dynamicNft/frown.svg', { encoding: 'utf-8' });
  const highSvg = await fs.readFileSync('./images/dynamicNft/happy.svg', { encoding: 'utf-8' });

  const args = [ethUsdPriceFeedAddress, lowSvg, highSvg];

  log('🚀 Deploying DynamicSvgNft...');
  const dynamicSvgNft = await deploy('DynamicSvgNft', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: helperNetworkConfig[network.name].blockConfirmations || 1
  });
  log('✅ DynamicSvgNft deployed!');

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(dynamicSvgNft.address, args, 'contracts/DynamicSvgNft.sol:DynamicSvgNft');
  }

  log('--------------------------------------------');
};

deployNft.tags = ['all', 'dynamicsvg', 'main'];
export default deployNft;
import { network } from 'hardhat';
import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import verify from '../utils/verify';

const deployFundMe: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  let ethUsdPriceFeedAddress: string;
  if(developmentChains.includes(network.name)) {
    const ethUsdAggregator = await get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  }else {
    ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed;
  }

  const args = [ethUsdPriceFeedAddress];

  log('🚀 Deploying FundMe...');
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1
  });

  if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args);
  }

  log('--------------------------------------------');
};

deployFundMe.tags = ['all', 'fundme'];
export default deployFundMe;
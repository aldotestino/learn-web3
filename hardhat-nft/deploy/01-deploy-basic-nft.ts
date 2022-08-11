import { network } from 'hardhat';
import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import verify from '../utils/verify';
import { helperNetworkConfig, developmentChains } from '../helper-hardhat-config';

const deployNft: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();


  log('🚀 Deploying BasicNft...');
  const basicNft = await deploy('BasicNft', {
    from: deployer,
    log: true,
    waitConfirmations: helperNetworkConfig[network.name].blockConfirmations || 1
  });
  log('✅ BasicNft deployed!');

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(basicNft.address, [], 'contracts/BasicNft.sol:BasicNft');
  }
};

deployNft.tags = ['all', 'basicnft', 'main'];
export default deployNft; 
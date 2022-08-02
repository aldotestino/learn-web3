import { network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { DECIMALS, developmentChains, INITIAL_ANSWER } from '../helper-hardhat-config';

const deployMocks: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if(developmentChains.includes(network.name)) {
    log('🚀 Local network detected! Deploying mocks...');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER]
    });
    log('✅ Mocks deployed!');
    log('--------------------------------------------');
  }
};

deployMocks.tags = ['all', 'mocks'];
export default deployMocks;

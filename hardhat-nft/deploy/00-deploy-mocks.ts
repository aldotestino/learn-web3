import { ethers, network } from 'hardhat';
import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { DECIMALS, developmentChains, INITIAL_PRICE } from '../helper-hardhat-config';

const BASE_FEE = ethers.utils.parseEther('0.25');
const GAS_PRICE_LINK = 1e9;

const deployMocks: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log('🚀 Local network detected! Deploying mocks...');
    await deploy('VRFCoordinatorV2Mock', {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK]
    });

    await deploy('MockV3Aggregator', {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE]
    });

    log('✅ Mocks deployed!');
    log('--------------------------------------------');
  }

};

deployMocks.tags = ['all', 'mocks'];
export default deployMocks; 
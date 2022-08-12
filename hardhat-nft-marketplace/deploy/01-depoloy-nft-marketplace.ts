import { network } from 'hardhat';
import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import verify from '../utils/verify';
import { helperNetworkConfig, developmentChains } from '../helper-hardhat-config';

const CONTRACT_NAME = 'NftMarketplace';

const deployNft: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();


  log(`🚀 Deploying ${CONTRACT_NAME}...`);
  const nftMarketplace = await deploy(CONTRACT_NAME, {
    from: deployer,
    log: true,
    waitConfirmations: helperNetworkConfig[network.name].blockConfirmations || 1
  });
  log(`✅ ${CONTRACT_NAME} deployed!`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(nftMarketplace.address, [], `contracts/${CONTRACT_NAME}.sol:${CONTRACT_NAME}`);
  }
};

deployNft.tags = ['all', CONTRACT_NAME.toLowerCase()];
export default deployNft; 
import { network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';
import { DeployFunction, DeploymentsExtension } from 'hardhat-deploy/dist/types';

const FRONTEND_CONTRACTS_FILE = path.join(__dirname, '..', '..', 'nextjs-nft-marketplace-moralis', 'src', 'constants', 'networkMapping.json');

const updateFrontend: DeployFunction = async ({ deployments }) => {
  if (process.env.UPDATE_FRONTEND) {
    console.log('Updating frontend...');
    await updateContractAddresses(deployments);
  }
};

async function updateContractAddresses(deployememts: DeploymentsExtension) {
  const { address } = await deployememts.get('NftMarketplace');
  const chainId = network.config.chainId?.toString();

  const contractAddresses = JSON.parse(fs.readFileSync(FRONTEND_CONTRACTS_FILE, 'utf-8'));

  console.log({ contractAddresses, address });

  if (chainId! in contractAddresses) {
    if (!contractAddresses[chainId!]['NftMarketplace'].includes(address)) {
      contractAddresses[chainId!]['NftMarketplace'].push(address);
    }
  } else {
    contractAddresses[chainId!]['NftMarketplace'] = [address];
  }

  fs.writeFileSync(FRONTEND_CONTRACTS_FILE, JSON.stringify(contractAddresses));
}

updateFrontend.tags = ['all', 'frontend'];
export default updateFrontend; 
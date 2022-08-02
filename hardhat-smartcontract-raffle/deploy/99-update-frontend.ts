import 'dotenv/config';
import { deployments, ethers, network } from 'hardhat';
import * as fs from 'fs';
import path from 'path';

const FRONTEND_ADDRESSES_FILE = path.join(__dirname, '..', '..', 'nextjs-smartcontract-raffle', 'src', 'constants', 'contractAddresses.json');
const FRONTEND_ABI_FILE = path.join(__dirname, '..', '..', 'nextjs-smartcontract-raffle', 'src', 'constants', 'abi.json');

const updateFrontend = async () => {
  if (process.env.UPDATE_FRONTEND) {
    console.log('🚀 Updating frontend');
    updateContractAddresses();
    updateAbi();
  }
};

async function updateContractAddresses() {
  const { address } = await deployments.get('Raffle');
  const contractAddresses = JSON.parse(fs.readFileSync(FRONTEND_ADDRESSES_FILE, 'utf-8'));

  const chainId = network.config.chainId;

  if (chainId) {
    if (chainId.toString() in contractAddresses) {
      if (!contractAddresses[chainId].includes(address)) {
        contractAddresses[chainId].push(address);
      }
    } else {
      contractAddresses[chainId] = [address];
    }
  }

  fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(contractAddresses));
}

async function updateAbi() {
  const { abi, address } = await deployments.get('Raffle');
  const raffle = await ethers.getContractAt(abi, address);
  fs.writeFileSync(FRONTEND_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json).toString());
}

updateFrontend.tags = ['all', 'frontend'];
export default updateFrontend; 

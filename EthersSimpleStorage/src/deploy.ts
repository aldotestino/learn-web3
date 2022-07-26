import * as ethers from 'ethers';
import * as fs from 'fs';
import { RPC_URL, PRIVATE_KEY, CONTRACT_ABI_PATH, CONTRACT_BIN_PATH } from './vars';

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const abi = fs.readFileSync(CONTRACT_ABI_PATH, 'utf-8');
  const binary = fs.readFileSync(CONTRACT_BIN_PATH, 'utf-8');

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  console.log('deployng...');
  const contract = await contractFactory.deploy();
  console.log(contract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
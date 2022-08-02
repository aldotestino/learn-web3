import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { FundMe } from '../typechain-types';

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMeDeploy = await deployments.get('FundMe');
  const fundMe = (await ethers.getContractAt(fundMeDeploy.abi, fundMeDeploy.address)) as FundMe;

  console.log('Withdrawing contract...');
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log('Withdrawed');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
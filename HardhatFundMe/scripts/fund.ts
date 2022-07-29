import { deployments, ethers, getNamedAccounts } from 'hardhat';

async function main() {
  const { deployer } = await getNamedAccounts();
  
  const fundMeDeploy = await deployments.get('FundMe');

  console.log(fundMeDeploy.address);
  const fundMe = await ethers.getContractAt(fundMeDeploy.abi, fundMeDeploy.address);

  console.log('Funding contract...');
  const transactionResponse = await fundMe.fund({ value: ethers.utils.parseEther('0.04') });
  await transactionResponse.wait(1);
  console.log('Funded');

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
import { ethers, run, network } from 'hardhat';

async function main() {
  const simpleStorageFactory = await ethers.getContractFactory('SimpleStorage');
  console.log('🚀 deploying contract...');
  const simpleStorage = await simpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`✅ Deployed contract to: https://rinkeby.etherscan.io/address/${simpleStorage.address}`);
  
  /* VERIFICA SU ETHERSCAN */
  if(network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deployTransaction.wait(6); // aspetto 6 blocchi per essere sicuro 
    await verify(simpleStorage.address);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value is: ${currentValue.toString()}`);

  const transactionResponse = await simpleStorage.store(4);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated value is: ${updatedValue}`);
}

async function verify(contractAddress: string, args = []) {
  console.log('🧐 Verifying contract...');
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args
    });
  }catch(e: any) {
    if(e.message.toLowerCase().includes('already verified')) {
      console.log('✅ Already verified');
    }else {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

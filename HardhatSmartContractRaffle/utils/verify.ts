import { run } from 'hardhat';

export default async (contractAddress: string, args?: any[]) => {
  console.log('🧐 Verifying contract...');
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args
    });
    console.log('✅ Contract verified!');
  } catch (e: any) {
    if (e.message.toLowerCase().includes('already verified')) {
      console.log('✅ Already verified!');
    } else {
      console.log(e);
    }
  }
};
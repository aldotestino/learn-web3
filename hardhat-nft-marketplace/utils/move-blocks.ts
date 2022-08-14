import { network } from 'hardhat';

function sleep(timeMillis: number) {
  return new Promise(resolve => setTimeout(resolve, timeMillis));
}

async function moveBlocks(amount: number, sleepAmount = 0) {
  console.log('⛏ Moving blocks...');
  for (let i = 0; i < amount; i++) {
    await network.provider.request({
      method: 'evm_mine',
      params: []
    });
    if (sleepAmount) {
      console.log(`Sleeping for ${sleepAmount}ms...`);
      await sleep(sleepAmount);
    }
  }
}

export {
  sleep,
  moveBlocks
};
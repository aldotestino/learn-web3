import { deployments, ethers, network } from 'hardhat';
import { BasicNft, NftMarketplace } from '../typechain-types';
import { moveBlocks } from '../utils/move-blocks';

const TOKEN_ID = 0;

async function cancelItem() {
  const { abi: abi1, address: address1 } = await deployments.get('NftMarketplace');
  const nftMarketplace = (await ethers.getContractAt(abi1, address1)) as NftMarketplace;

  const { abi: abi2, address: address2 } = await deployments.get('BasicNft');
  const basicNft = (await ethers.getContractAt(abi2, address2)) as BasicNft;

  const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
  await tx.wait(1);
  console.log('NFT Canceled!');
  if (network.config.chainId === 31337) {
    await moveBlocks(1, 1000);
  }
}

cancelItem()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
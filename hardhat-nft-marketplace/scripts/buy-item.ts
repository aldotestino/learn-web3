import { deployments, ethers, network } from 'hardhat';
import { BasicNft, NftMarketplace } from '../typechain-types';
import { moveBlocks } from '../utils/move-blocks';

const TOKEN_ID = 1;

async function buyItem() {
  const { abi: abi1, address: address1 } = await deployments.get('NftMarketplace');
  const nftMarketplace = (await ethers.getContractAt(abi1, address1)) as NftMarketplace;

  const { abi: abi2, address: address2 } = await deployments.get('BasicNft');
  const basicNft = (await ethers.getContractAt(abi2, address2)) as BasicNft;

  const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
  const price = listing.price.toString();

  const tx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price });
  await tx.wait(1);
  console.log('NFT Bought!');
  if (network.config.chainId === 31337) {
    await moveBlocks(1, 1000);
  }
}

buyItem()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
import { deployments, ethers, network } from 'hardhat';
import { BasicNft, NftMarketplace } from '../typechain-types';
import { moveBlocks } from '../utils/move-blocks';

const PRICE = ethers.utils.parseEther('0.01');

async function mintAndList() {
  const { abi: abi1, address: address1 } = await deployments.get('NftMarketplace');
  const nftMarketplace = (await ethers.getContractAt(abi1, address1)) as NftMarketplace;

  const { abi: abi2, address: address2 } = await deployments.get('BasicNft');
  const basicNft = (await ethers.getContractAt(abi2, address2)) as BasicNft;

  console.log('⛏ Minting Basic NFT...');
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events![0].args!.tokenId;
  console.log('✅ NFT succesfully minted!');

  console.log('ℹ️ Approving NFT...');
  const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
  await approvalTx.wait(1);
  console.log('✅ NFT succesfully approved!');

  console.log('ℹ️ Listing NFT...');
  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
  await tx.wait(1);
  console.log('✅ NFT succesfully listed!');

  if (network.config.chainId === 31337) {
    await moveBlocks(1, 1000);
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
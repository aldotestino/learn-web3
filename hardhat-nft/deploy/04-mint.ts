import { ethers, network, deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { developmentChains } from '../helper-hardhat-config';
import { BasicNft, DynamicSvgNft, RandomIpfsNft, VRFCoordinatorV2Mock } from '../typechain-types';

const deployMocks: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  // mint basic nft
  const { abi: abi1, address: address1 } = await get('BasicNft');
  const basicNft = (await ethers.getContractAt(abi1, address1)) as BasicNft;
  const basicNftMintTx = await basicNft.mintNft();
  await basicNftMintTx.wait(1);
  console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`);

  // mint random ipfs nft
  const { abi: abi2, address: address2 } = await get('RandomIpfsNft');
  const randomIpfsNft = (await ethers.getContractAt(abi2, address2)) as RandomIpfsNft;
  const mintFee = await randomIpfsNft.getMintFee();
  const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() });
  const randomIpfsNftTxMintReceipt = await randomIpfsNftMintTx.wait(1);
  // eslint-disable-next-line no-async-promise-executor
  await new Promise<void>(async (resolve, reject) => {
    setTimeout(() => reject('Timeout: \'NFTMinted\' event did not fire'), 300000);
    randomIpfsNft.once('NftMinted', async () => {
      resolve();
    });
    if (developmentChains.includes(network.name)) {
      const requestId = randomIpfsNftTxMintReceipt.events![1].args!.requestId.toString();
      const { abi: abi3, address: address3 } = await deployments.get('VRFCoordinatorV2Mock');
      const vrfCoordinatorV2Mock = (await ethers.getContractAt(abi3, address3)) as VRFCoordinatorV2Mock;
      await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address);
    }
  });
  console.log(`Random IPFS NFT index 0 has tokenURI: ${await randomIpfsNft.tokenURI(0)}`);

  // mint dynamic svg nft
  const highValue = ethers.utils.parseEther('4000');
  const { abi: abi4, address: address4 } = await get('DynamicSvgNft');
  const dynamicSvgNft = (await ethers.getContractAt(abi4, address4)) as DynamicSvgNft;
  const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString());
  await dynamicSvgNftMintTx.wait(1);
  console.log(`Dynamic SVG NFT index 0 has tokenURI: ${await dynamicSvgNft.tokenURI(0)}`);
};

deployMocks.tags = ['all', 'mint'];
export default deployMocks; 
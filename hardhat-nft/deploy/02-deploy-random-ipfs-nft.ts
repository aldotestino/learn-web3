import { ethers, network } from 'hardhat';
import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { developmentChains, helperNetworkConfig } from '../helper-hardhat-config';
import verify from '../utils/verify';
import { storageImages, storeTokenUriMetadata } from '../utils/uploadToPinata';
import { NftMetadata } from '../utils/types';

const imagesLocation = './images/randomNft';

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther('30');

const deployRaffle: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  let tokenUris = [
    'ipfs://QmY3tp8FqaqJzaWHWAcqzdyK4XcaFgMbbcWcs2jjHfK54v',
    'ipfs://QmS8NXJui2SEbTAYLGcE3M1TmuaDh6dGRuj3xWmmjQqCZ6',
    'ipfs://QmaWzpJrSnCRTkpxWHRhaihZcgt2KUk3u9fhgCDgBVXQum'
  ];
  let vrfCoordinatorV2Address;
  let subscriptionId;

  if (process.env.UPLOAD_TO_PINATA === 'true') {
    tokenUris = await hendleTokenUris();
  }

  if (developmentChains.includes(network.name)) {
    const { abi, address } = await get('VRFCoordinatorV2Mock');
    vrfCoordinatorV2Address = address;

    const vrfCoordinatorV2Mock = await ethers.getContractAt(abi, address);

    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;

    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = helperNetworkConfig[network.name].vrfCoordinatorV2;
    subscriptionId = helperNetworkConfig[network.name].subscriptionId;
  }

  const { mintFee, gasLane, callbackGasLimit } = helperNetworkConfig[network.name];

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    tokenUris,
    mintFee,
  ];

  log('🚀 Deploying RandomIpfsNft...');
  const randomIpfsNft = await deploy('RandomIpfsNft', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: helperNetworkConfig[network.name].blockConfirmations || 1
  });
  log('✅ RandomIpfsNft deployed!');

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(randomIpfsNft.address, args, 'contracts/RandomIpfsNft.sol:RandomIpfsNft');
  }

  log('--------------------------------------------');
};

deployRaffle.tags = ['all', 'randomipfs', 'main'];
export default deployRaffle;

async function hendleTokenUris() {
  const tokenUris: string[] = [];
  const { responses: imageUploadResponses, files } = await storageImages(imagesLocation);
  console.log('⚠️ Uploading token URIs to Pinata...');
  for (const imageUploadResponseIndex in imageUploadResponses) {
    const name = files[imageUploadResponseIndex].replace('.png', '');
    const tokenUriMetadata: NftMetadata = {
      name,
      description: `An adorable ${name} pup!`,
      image: `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`,
    };
    const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
    tokenUris.push(`ipfs://${metadataUploadResponse?.IpfsHash}`);
  }
  console.log('✅ Token URIs succesfully uploaded to Pinata!');
  console.log(tokenUris);

  return tokenUris;
}
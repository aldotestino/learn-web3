import { ethers, network } from 'hardhat';
import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { developmentChains, helperNetworkConfig } from '../helper-hardhat-config';
import verify from '../utils/verify';

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther('30');

const deployRaffle: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  let vrfCoordinatorV2Address;
  let subscriptionId;

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

  const { entranceFee, gasLane, callbackGasLimit, interval } = helperNetworkConfig[network.name];

  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    interval
  ];

  log('🚀 Deploying Raffle...');
  const raffle = await deploy('Raffle', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: helperNetworkConfig[network.name].blockConfirmations || 1
  });
  log('✅ Raffle deployed!');

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(raffle.address, args);
  }

  log('--------------------------------------------');
};

deployRaffle.tags = ['all', 'raffle'];
export default deployRaffle; 
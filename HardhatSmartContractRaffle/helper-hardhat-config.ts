import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

interface HelperNetworkConfig {
  [key: string]: {
    blockConfirmations: number,
    vrfCoordinatorV2?: string,
    entranceFee: BigNumber,
    gasLane: string,
    subscriptionId?: string,
    callbackGasLimit: string,
    interval: string
  }
}

export const helperNetworkConfig: HelperNetworkConfig = {
  rinkeby: {
    blockConfirmations: 6,
    vrfCoordinatorV2: '0x6168499c0cFfCaCD319c818142124B7A15E857ab',
    entranceFee: ethers.utils.parseEther('0.01'),
    gasLane: '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
    subscriptionId: '0',
    callbackGasLimit: '500000',
    interval: '30'
  },
  hardhat: {
    blockConfirmations: 1,
    entranceFee: ethers.utils.parseEther('0.01'),
    gasLane: '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
    callbackGasLimit: '500000',
    interval: '30'
  }
};

export const developmentChains = ['hardhat', 'localhost']; 
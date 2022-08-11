import { assert, expect } from 'chai';
import { network, deployments, ethers } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { RandomIpfsNft, VRFCoordinatorV2Mock } from '../../typechain-types';

!developmentChains.includes(network.name) ? describe.skip :
  describe('Random IPFS NFT Unit Tests', () => {
    let randomIpfsNft: RandomIpfsNft;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
    let deployer;

    before(async () => {
      const accounts = await ethers.getSigners();
      deployer = accounts[0];

      await deployments.fixture(['mocks', 'randomipfs']);
      const { abi: abi1, address: address1 } = await deployments.get('RandomIpfsNft');
      randomIpfsNft = (await ethers.getContractAt(abi1, address1)) as RandomIpfsNft;

      const { abi: abi2, address: address2 } = await deployments.get('VRFCoordinatorV2Mock');
      vrfCoordinatorV2Mock = (await ethers.getContractAt(abi2, address2)) as VRFCoordinatorV2Mock;
    });

    describe('constructor', () => {
      it('sets starting values correctly', async () => {
        const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0);
        // const isInitialized = await randomIpfsNft.getInitialized()
        assert(dogTokenUriZero.includes('ipfs://'));
      });
    });

    describe('requestNft', () => {
      it('fails if payment isn\'t sent with the request', async () => {
        await expect(randomIpfsNft.requestNft()).to.be.revertedWith('RandomIpfsNft__NeedMoreETHSent');
      });

      it('emits an event and kicks off a random word request', async () => {
        const fee = await randomIpfsNft.getMintFee();
        await expect(randomIpfsNft.requestNft({ value: fee.toString() })).to.emit(randomIpfsNft, 'NftRequested');
      });
    });

    describe('fulfillRandomWords', async () => {
      it('mints NFT after random number is returned', async () => {
        // eslint-disable-next-line no-async-promise-executor
        await new Promise<void>(async (resolve, reject) => {
          randomIpfsNft.once('NftMinted', async () => {
            try {
              const tokenUri = await randomIpfsNft.tokenURI('0');
              const tokenCounter = await randomIpfsNft.getTokenCounter();

              assert.equal(tokenUri.toString().includes('ipfs://'), true);
              assert.equal(tokenCounter.toString(), '1');
              resolve();
            } catch (e) {
              console.log(e);
              reject(e);
            }
          });

          try {
            const fee = await randomIpfsNft.getMintFee();
            const requestNftResponse = randomIpfsNft.requestNft({
              value: fee.toString()
            });
            const requestNftReceipt = await (await requestNftResponse).wait(1);

            await vrfCoordinatorV2Mock.fulfillRandomWords(
              requestNftReceipt.events![1].args!.requestId,
              randomIpfsNft.address
            );
          } catch (e) {
            console.log(e);
            reject(e);
          }
        });
      });
    });
  });
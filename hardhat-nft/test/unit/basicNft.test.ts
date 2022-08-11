import { assert } from 'chai';
import { network, deployments, ethers } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { BasicNft } from '../../typechain-types';

!developmentChains.includes(network.name) ? describe.skip :
  describe('Basic NFT Unit Tests', () => {
    let basicNft: BasicNft;
    let deployer;

    before(async () => {
      const accounts = await ethers.getSigners();
      deployer = accounts[0];

      await deployments.fixture(['mocks', 'basicNft']);
      const { abi, address } = await deployments.get('BasicNft');
      basicNft = (await ethers.getContractAt(abi, address)) as BasicNft;
    });

    it('Allows users to mint an NFT, and updates appropriately', async () => {
      const txResponse = await basicNft.mintNft();
      await txResponse.wait(1);

      const tokenURI = await basicNft.tokenURI(0);
      const tokenCounter = await basicNft.getTokenCounter();

      assert.equal(tokenCounter.toString(), '1');
      assert.equal(tokenURI, await basicNft.TOKEN_URI());
    });
  });
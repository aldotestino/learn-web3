// Run on testnet
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { FundMe } from '../../typechain-types';
import { assert } from 'chai';

developmentChains.includes(network.name) 
  ? describe.skip :
  describe('FundMe', async () => {
    let fundMe: FundMe;
    let deployer: string;

    const sendValue = ethers.utils.parseEther('0.04');

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;

      const fundMeDeploy = await deployments.get('FundMe');
      fundMe = (await ethers.getContractAt(fundMeDeploy.abi, fundMeDeploy.address)) as FundMe;
    });

    it('Allows people to fund and withdraw', async () => {
      await fundMe.fund({ value: sendValue });
      await fundMe.withdraw();
      const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      assert.equal(endingFundMeBalance.toString(), '0');
    });
  });
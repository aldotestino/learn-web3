// Run locally
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { FundMe, MockV3Aggregator } from '../../typechain-types';
import { assert, expect } from 'chai';
import { developmentChains } from '../../helper-hardhat-config';

!developmentChains.includes(network.name) 
  ? describe.skip :
  describe('FundMe', async () => {
    let fundMe: FundMe;
    let deployer: string;
    let mockV3Aggregator: MockV3Aggregator;

    const sendValue = ethers.utils.parseEther('1');

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(['all']);
    
      // replacement for fundMe = await ethers.getContract('FundMe)
      const fundMeDeploy = await deployments.get('FundMe');
      fundMe = (await ethers.getContractAt(fundMeDeploy.abi, fundMeDeploy.address)) as FundMe;

      // same here
      const mockV3AggregatorDeploy = await deployments.get('MockV3Aggregator');
      mockV3Aggregator = (await ethers.getContractAt(mockV3AggregatorDeploy.abi, mockV3AggregatorDeploy.address)) as MockV3Aggregator;


    });

    describe('constructor', async () => {
      it('sets the aggregator address correctly', async () => {
        const response = await fundMe.getPriceFeed();
        assert.equal(response, mockV3Aggregator.address);
      });
    });

    describe('fund', async () => {
      it('Fails if you don\'t send enough ETH', async () => {
        await expect(fundMe.fund()).to.be.revertedWith('Sei uno scorzo');
      });

      it('Updates the amount funded data structure', async () => {
        await fundMe.fund({ value: sendValue });
        const response = await fundMe.getAddressToAmountFunded(deployer);

        assert.equal(response.toString(), sendValue.toString());
      });

      it('adds funder to array of funders', async () => {
        await fundMe.fund({ value: sendValue });
        const funder = await fundMe.getFunder(0);

        assert.equal(funder, deployer);
      });
    });

    describe('withdraw', async () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      });

      it('Withdraw ETH from a single founder', async () => {
        const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

        const transactionResponse = await fundMe.withdraw();
        const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
        const gasCost = gasUsed.mul(effectiveGasPrice); // calcolo gas pagato dall'utente per effettuare la transazione
      
        const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

        assert.equal(endingFundMeBalance.toString(), '0');
        assert.equal(
          startingFundMeBalance.add(startingDeployerBalance).toString(), 
          endingDeployerBalance.add(gasCost).toString()
        );
      });

      it('Allows us to withdraw with multiple funders', async () => {
        const accounts = await ethers.getSigners();

        accounts.forEach(async account => {
          const fundMeConnectedContract = await fundMe.connect(account);
          await fundMeConnectedContract.fund({ value: sendValue });
        });

        const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

        const transactionResponse = await fundMe.withdraw();
        const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
        const gasCost = gasUsed.mul(effectiveGasPrice);

        await expect(fundMe.getFunder(0)).to.be.reverted;

        accounts.forEach(async account => {
          assert.equal(await (await fundMe.getAddressToAmountFunded(account.address)).toString(), '0');
        });
      });

      it('Only allows the owner to withdraw', async () => {
        const accounts = await ethers.getSigners();
        const attacker = accounts[1];

        const attackerConnectedContract = await fundMe.connect(attacker);
        await expect(attackerConnectedContract.withdraw()).to.be.reverted; // revertedWith('FundMe__NotOwner)
      });

      it('Cheaper withdraw testing...', async () => {
        const accounts = await ethers.getSigners();

        accounts.forEach(async account => {
          const fundMeConnectedContract = await fundMe.connect(account);
          await fundMeConnectedContract.fund({ value: sendValue });
        });

        const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

        const transactionResponse = await fundMe.cheaperWithdraw();
        const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
        const gasCost = gasUsed.mul(effectiveGasPrice);

        await expect(fundMe.getFunder(0)).to.be.reverted;

        accounts.forEach(async account => {
          assert.equal(await (await fundMe.getAddressToAmountFunded(account.address)).toString(), '0');
        });
      });
    });
  });
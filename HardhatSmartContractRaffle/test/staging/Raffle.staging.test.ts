import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains, helperNetworkConfig } from '../../helper-hardhat-config';
import { Raffle } from '../../typechain-types';
import { assert, expect } from 'chai';
import { BigNumber } from 'ethers';

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle', async () => {
    let raffle: Raffle;
    let raffleEntranceFee: BigNumber;
    let deployer: string;

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;

      const raffleDeployement = await deployments.get('Raffle');
      raffle = (await ethers.getContractAt(raffleDeployement.abi, raffleDeployement.address)) as Raffle;

      raffleEntranceFee = await raffle.getEntranceFee();
    });

    describe('fulfillRandomWords', () => {
      it('works with live Chainlink Keepers and Chainlink VRF, we get a random winner', async () => {
        const startingTimeStamp = await raffle.getLatestTimeStamp();
        const deployerAccount = (await ethers.getSigners())[0];

        // eslint-disable-next-line no-async-promise-executor
        await new Promise<void>(async (resolve, reject) => {
          raffle.once('WinnerPicked', async () => {
            console.log('WinnerPicked event fired!');
            try {
              const recentWinner = await raffle.getRecentWinner();
              const raffleState = await raffle.getRaffleState();
              const winnerEndingBalance = await deployerAccount.getBalance();
              const endingTimeStamp = await raffle.getLatestTimeStamp();

              await expect(raffle.getPlayer(0)).to.be.reverted; // check if player array has been resetted
              assert.equal(recentWinner.toString(), deployer);
              assert.equal(raffleState.toString(), '0');
              assert.equal(
                winnerEndingBalance.toString(),
                winnerStartingBalance.add(raffleEntranceFee).toString()
              );
              assert(endingTimeStamp > startingTimeStamp);
            } catch (e) {
              reject(e);
            }
            resolve();
          });

          await raffle.enterRaffle({ value: raffleEntranceFee });
          const winnerStartingBalance = await deployerAccount.getBalance();
        });
      });
    });
  });
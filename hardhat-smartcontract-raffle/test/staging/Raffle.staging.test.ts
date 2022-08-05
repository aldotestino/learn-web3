import { deployments, ethers, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { Raffle } from '../../typechain-types';
import { assert, expect } from 'chai';
import { BigNumber } from 'ethers';

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle', async () => {
    let raffle: Raffle;
    let raffleEntranceFee: BigNumber;

    beforeEach(async () => {
      const { abi, address } = await deployments.get('Raffle');
      console.log(`ℹ️ Getting contract at: ${address}`);
      raffle = (await ethers.getContractAt(abi, address)) as Raffle;
      console.log('ℹ️ Contract succesfully found');
      raffleEntranceFee = await raffle.getEntranceFee();
    });

    describe('fulfillRandomWords', () => {
      it('works with live Chainlink Keepers and Chainlink VRF, we get a random winner', async () => {
        const startingTimeStamp = await raffle.getLatestTimeStamp();
        console.log(`ℹ️ starting timestamp: ${startingTimeStamp}`);
        const accounts = await ethers.getSigners();

        console.log('ℹ️ Setting up listener...');
        // eslint-disable-next-line no-async-promise-executor
        await new Promise<void>(async (resolve, reject) => {

          raffle.once('WinnerPicked', async () => {
            console.log('WinnerPicked event fired!');
            try {
              const recentWinner = await raffle.getRecentWinner();
              const raffleState = await raffle.getRaffleState();
              const winnerEndingBalance = await accounts[0].getBalance();
              const endingTimeStamp = await raffle.getLatestTimeStamp();

              await expect(raffle.getPlayer(0)).to.be.reverted; // check if player array has been resetted
              assert.equal(recentWinner.toString(), accounts[0].address);
              assert.equal(raffleState.toString(), '0');
              assert.equal(
                winnerEndingBalance.toString(),
                winnerStartingBalance.add(raffleEntranceFee).toString()
              );
              assert(endingTimeStamp > startingTimeStamp);
              resolve();
            } catch (e) {
              console.log(e);
              reject(e);
            }
          });

          console.log('ℹ️ Entering raffle');
          const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
          console.log(`ℹ️ Waiting for transaction https://rinkeby.etherscan.io/tx/${tx.hash}`);
          await tx.wait(1);
          console.log('ℹ️ Transaction ended, waiting for event...');
          const winnerStartingBalance = await accounts[0].getBalance();
        });
      });
    });
  });
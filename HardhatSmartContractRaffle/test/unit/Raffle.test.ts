import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains, helperNetworkConfig } from '../../helper-hardhat-config';
import { Raffle, VRFCoordinatorV2Mock } from '../../typechain-types';
import { assert, expect } from 'chai';
import { BigNumber } from 'ethers';

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle', async () => {
    let raffle: Raffle;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
    let raffleEntranceFee: BigNumber;
    let deployer: string;
    let interval: BigNumber;

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(['all']);

      const raffleDeployement = await deployments.get('Raffle');
      raffle = (await ethers.getContractAt(raffleDeployement.abi, raffleDeployement.address)) as Raffle;

      const vrfCoordinatorV2MockDeployement = await deployments.get('VRFCoordinatorV2Mock');
      vrfCoordinatorV2Mock = (await ethers.getContractAt(
        vrfCoordinatorV2MockDeployement.abi,
        vrfCoordinatorV2MockDeployement.address
      )) as VRFCoordinatorV2Mock;

      raffleEntranceFee = await raffle.getEntranceFee();
      interval = await raffle.getInterval();
    });

    describe('constructor', () => {
      it('initializes the raffle correctly', async () => {
        const raffleState = await raffle.getRaffleState();

        assert.equal(raffleState.toString(), '0');
        assert.equal(interval.toString(), helperNetworkConfig[network.name].interval);
      });
    });

    describe('enter raffle', () => {
      it('reverts when you don\'t pay enough', async () => {
        await expect(raffle.enterRaffle()).to.be.revertedWith('Raffle__NotEnoughETHEntered');
      });

      it('records player when they enter', async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });

        const playerFromContract = await raffle.getPlayer(0);
        assert.equal(playerFromContract, deployer);
      });

      it('emits event on enter', async () => {
        await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, 'RaffleEnter');
      });

      it('doesn\'t allow entrance when raffle is calulating', async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });

        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
        await network.provider.send('evm_mine', []);

        await raffle.performUpkeep([]);
        await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith('Raffle__NotOpen');
      });
    });

    describe('check upkeep', () => {
      it('returns false if people haven\'t sent any ETH', async () => {
        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
        await network.provider.send('evm_mine', []);

        const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
        assert(!upkeepNeeded);
      });

      it('returns false if raffle isn\'t open', async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });

        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
        await network.provider.send('evm_mine', []);

        await raffle.performUpkeep([]);
        const raffleState = await raffle.getRaffleState();
        const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);

        assert.equal(raffleState.toString(), '1');
        assert.equal(upkeepNeeded, false);
      });

      it('returns false if enough time hasn\'t passed', async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });

        await network.provider.send('evm_increaseTime', [interval.toNumber() - 1]);
        await network.provider.send('evm_mine', []);

        const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
        assert(!upkeepNeeded);
      });

      it('returns true if enough time has passed, has players, eth and is open', async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });

        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
        await network.provider.send('evm_mine', []);

        const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
        assert(upkeepNeeded);
      });
    });

    describe('perform upkeep', () => {
      it('can only run if checkupkeep is true', async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });

        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
        await network.provider.send('evm_mine', []);

        const tx = await raffle.performUpkeep([]);
        assert(tx);
      });

      it('reverts when checkupkeep is false', async () => {
        await expect(raffle.performUpkeep([])).to.be.revertedWith('Raffle_UpkeepNotNeeded');
      });

      it('updates the raffle state, emits an event and calls the vrf coordinator', async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });

        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
        await network.provider.send('evm_mine', []);

        const txResponse = await raffle.performUpkeep([]);
        const txReceipt = await txResponse.wait(1);

        const requestId: BigNumber = txReceipt.events![1].args!.requestId;
        const raffleState = await raffle.getRaffleState();

        assert(requestId.toNumber() > 0);
        assert(raffleState == 1);
      });
    });

    describe('fulfill random words', () => {
      beforeEach(async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });

        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
        await network.provider.send('evm_mine', []);
      });

      it('can only be called after performUpkeep', async () => {
        await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address))
          .to.be.revertedWith('nonexistent request');
        await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address))
          .to.be.revertedWith('nonexistent request');
      });

      it('picks a winner, resets the raffle and sends money', async () => {
        const additionalEntrance = 3;
        const startingAccountIndex = 1;
        const accounts = await ethers.getSigners();

        for (let i = startingAccountIndex; i < startingAccountIndex + additionalEntrance; i++) {
          const accountConnectedRaffle = raffle.connect(accounts[i]);
          await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee });
        }

        const startingTimeStamp = await raffle.getLatestTimeStamp();

        // eslint-disable-next-line no-async-promise-executor
        await new Promise<void>(async (resolve, reject) => {
          raffle.once('WinnerPicked', async () => {
            try {
              const recentWinner = await raffle.getRecentWinner();

              console.log(`Recent winner: ${recentWinner}`);
              console.log(`Account 0: ${accounts[0].address}`);
              console.log(`Account 1: ${accounts[1].address}`);
              console.log(`Account 2: ${accounts[2].address}`);
              console.log(`Account 3: ${accounts[3].address}`);

              const raffleState = await raffle.getRaffleState();
              const endingTimeStamp = await raffle.getLatestTimeStamp();

              const numPlayers = await raffle.getNumberOfPlayers();
              const winnerEndingBalance = await accounts[1].getBalance();

              assert.equal(numPlayers.toString(), '0');
              assert.equal(raffleState.toString(), '0');
              assert(endingTimeStamp > startingTimeStamp);

              assert.equal(
                winnerEndingBalance.toString(),
                winnerStartingBalance
                  .add(raffleEntranceFee.mul(additionalEntrance))
                  .add(raffleEntranceFee)
                  .toString());
            } catch (e) {
              reject(e);
            }
            resolve();
          });

          const tx = await raffle.performUpkeep([]);
          const winnerStartingBalance = await accounts[1].getBalance();
          const txReceipt = await tx.wait(1);

          await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events![1].args!.requestId, raffle.address);
        });
      });
    });
  });
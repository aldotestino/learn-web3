import { assert, expect } from 'chai';
import { Signer } from 'ethers';
import { network, deployments, ethers } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { NftMarketplace, BasicNft } from '../../typechain-types';

!developmentChains.includes(network.name) ? describe.skip
  : describe('NFT Marketplace Unit Tests', () => {
    let nftMarketplace: NftMarketplace;
    let nftMarketplaceContract: NftMarketplace;
    let basicNft: BasicNft;
    const PRICE = ethers.utils.parseEther('0.1');
    const TOKEN_ID = 0;
    let deployer: Signer;
    let user: Signer;

    beforeEach(async () => {
      const accounts = await ethers.getSigners();
      deployer = accounts[0];
      user = accounts[1];

      await deployments.fixture('all');

      const { abi: abi1, address: address1 } = await deployments.get('NftMarketplace');
      nftMarketplaceContract = (await ethers.getContractAt(abi1, address1)) as NftMarketplace;

      nftMarketplace = nftMarketplaceContract.connect(deployer);

      const { abi: abi2, address: address2 } = await deployments.get('BasicNft');
      basicNft = (await ethers.getContractAt(abi2, address2)) as BasicNft;

      await basicNft.mintNft();
      await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID);
    });

    describe('listItem', () => {
      it('emits an event after listing an item', async () => {
        expect(await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit(
          nftMarketplace,
          'ItemListed'
        );
      });

      it('exclusively items that haven\'t been listed', async () => {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        const error = `NftMarketplace__AlreadyListed("${basicNft.address}", ${TOKEN_ID})`;

        await expect(
          nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
        ).to.be.revertedWith(error);
      });

      it('needs approval to list item', async () => {
        await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID);
        await expect(
          nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
        ).to.be.revertedWith('NftMarketplace__NotApprovedForMarketplace');
      });

      it('Updates listing with seller and price', async () => {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
        assert(listing.price.toString() == PRICE.toString());
        assert(listing.seller.toString() == await deployer.getAddress());
      });
    });

    describe('cancelListing', () => {
      it('reverts if there is no listing', async () => {
        const error = `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`;
        await expect(
          nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
        ).to.be.revertedWith(error);
      });

      it('reverts if anyone but the owner tries to call', async () => {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        nftMarketplace = nftMarketplaceContract.connect(user);
        await basicNft.approve(await user.getAddress(), TOKEN_ID);
        await expect(
          nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
        ).to.be.revertedWith('NftMarketplace__NotOwner');
      });

      it('emits event and remove listing', async () => {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        expect(await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.emit(nftMarketplace, 'ItemCanceled');

        const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
        assert(listing.price.toString() == '0');
      });
    });

    describe('buyItem', () => {
      it('reverts if the item isn\'t listed', async () => {
        await expect(
          nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
        ).to.be.revertedWith('NftMarketplace__NotListed');
      });

      it('reverts if the price isn\'t met', async () => {
        const error = `NftMarketplace__PriceNotMet("${basicNft.address}", ${TOKEN_ID}, ${PRICE.toString()})`;
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        await expect(
          nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
        ).to.be.revertedWith(error);
      });

      it('transfer the nft to the buyer and updates internal proceeds record', async () => {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        nftMarketplace = nftMarketplaceContract.connect(user);
        expect(
          await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
        ).to.emit(nftMarketplace, 'ItemBought');

        const newOwner = await basicNft.ownerOf(TOKEN_ID);
        const deployerProceeds = await nftMarketplace.getProceeds(await deployer.getAddress());

        assert(newOwner.toString() == await user.getAddress());
        assert(deployerProceeds.toString() == PRICE.toString());
      });
    });

    describe('updateListing', () => {
      it('must be owner and listed', async () => {
        await expect(
          nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
        ).to.be.revertedWith('NftMarketplace__NotListed');

        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        nftMarketplace = nftMarketplaceContract.connect(user);
        await expect(
          nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
        ).to.be.revertedWith('NftMarketplace__NotOwner');
      });

      it('updates the price of the item', async () => {
        const updatedPrice = ethers.utils.parseEther('0.2');
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        expect(
          await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, updatedPrice)
        ).to.emit(nftMarketplace, 'ItemListed');

        const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
        assert(listing.price.toString() === updatedPrice.toString());
      });
    });

    describe('withdrawProceeds', () => {
      it('doesn\'t allow 0 proceed withdrawls', async () => {
        await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith('NftMarketplace__NoProceeds');
      });

      it('withdraws proceeds', async () => {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        nftMarketplace = nftMarketplaceContract.connect(user);

        await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE });
        nftMarketplace = nftMarketplaceContract.connect(deployer);

        const deployerProceedsBefore = await nftMarketplace.getProceeds(await deployer.getAddress());
        const deployerBalanceBefore = await deployer.getBalance();
        const txResponse = await nftMarketplace.withdrawProceeds();
        const txReceipt = await txResponse.wait(1);
        const { gasUsed, effectiveGasPrice } = txReceipt;
        const gasCost = gasUsed.mul(effectiveGasPrice);
        const deployerBalanceAfter = await deployer.getBalance();

        assert(
          deployerBalanceAfter.add(gasCost).toString() === deployerProceedsBefore.add(deployerBalanceBefore).toString()
        );
      });
    });
  });
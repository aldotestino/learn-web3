import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { assert } from 'chai';
import { deployments, ethers } from 'hardhat';
import { INITIAL_SUPPLY } from '../../helper-hardhat-config';
import { OurToken } from '../../typechain-types';

describe('OurToken Unit Test', () => {
  let ourToken: OurToken;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];

    await deployments.fixture('all');
    const { abi, address } = await deployments.get('OurToken');
    ourToken = (await ethers.getContractAt(abi, address)) as OurToken;
  });

  it('Should have correct INITIAL_SUPPLY of token', async () => {
    const totalSupply = await ourToken.totalSupply();
    assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
  });

  it('Should be able to transfer tokens successfully to an address', async () => {
    const tokensToSend = ethers.utils.parseEther('10');
    await ourToken.transfer(user1.address, tokensToSend);
    const user1Balance = await ourToken.balanceOf(user1.address);
    assert.equal(tokensToSend.toString(), user1Balance.toString());
  });

  it('Should approve other address to spend token', async () => {
    const tokensToSpend = ethers.utils.parseEther('5');
    await ourToken.approve(user1.address, tokensToSpend);
    const ourToken1 = ourToken.connect(user1);
    await ourToken1.transferFrom(deployer.address, user1.address, tokensToSpend);
    const user1Balance = await ourToken1.balanceOf(user1.address);
    assert.equal(tokensToSpend.toString(), user1Balance.toString());
  });
});
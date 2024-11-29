import { Wallet, BigNumber } from 'ethers'
import { ethers, network, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { Registry } from '../typechain/Registry'
import { Factory } from '../typechain/Factory'
import { Cell } from '../typechain/Cell'
import { expect } from './shared/expect'
import { factoryFixture, attachCell } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe('Factory', async () => {
  let wallet: Wallet, creator: Wallet, user: Wallet;

  let testToken: TestERC20;
  let registry: Registry;
  let factory: Factory;

  const tokenURI = "https://gnfd-testnet-sp3.bnbchain.org/view/ted-test-bucket/ted-test-object/user_d.json"
  const encryptURL = "U2FsdGVkX1/8CtCQ4wr8lZ0DGbQ9ZapKoLuFKSIHL4qLvTM8p1ouNFs+PVATKBva"
  const encryptURLLong = "U2FsdGVkX18wkZRLCWtPDuMv+Wy0EE56DWViGGttiltR0raRdDmUFmPJ40uEeLEACaNmqn5JSAE706p/p2FuAsG9h0OBx7jimk5rp/I1YXQ="

  let loadFixTure: ReturnType<typeof createFixtureLoader>;

  before('create fixture loader', async () => {
    [wallet, creator, user] = await (ethers as any).getSigners()
    loadFixTure = createFixtureLoader([wallet])
  })

  beforeEach('deploy PunchIn', async () => {
    ; ({ testToken, registry, factory } = await loadFixTure(factoryFixture));
  })

  it('check state', async () => {
    expect(await registry.currentTokenId()).to.eq(BigNumber.from(1))
    expect(await factory.getFeeRate()).to.eq(ethers.constants.WeiPerEther.div(10))
  })

  describe('createCell', async () => {
    it('success', async () => {
      const tx = await factory.connect(creator).create(
        creator.address,
        tokenURI,
        encryptURL,
        ethers.constants.AddressZero,
        ethers.constants.WeiPerEther.div(10)
      )
      const receiption = await tx.wait()
      // console.log(receiption.events?.pop())
      expect(await registry.balanceOf(creator.address)).to.eq(1)
      const tokenId = await registry.tokenOfOwnerByIndex(creator.address, 0);
      const cellAddr = await factory.tokenId2Cell(tokenId);
      const cell: Cell = await attachCell(cellAddr);
      expect(await cell.getOwner()).to.eq(creator.address);
    })

    it('faild for repeated encryptURL', async () => {
      await factory.connect(creator).create(
        creator.address,
        tokenURI,
        encryptURL,
        ethers.constants.AddressZero,
        ethers.constants.WeiPerEther.div(10)
      )
      expect(factory.connect(creator).create(
        creator.address,
        tokenURI,
        encryptURL,
        ethers.constants.AddressZero,
        ethers.constants.WeiPerEther.div(10)
      )).to.revertedWith("EncryptURL already exist")
    })
  })

  describe('makeRequest', async () => {
    let cellZeroToken: Cell;
    let cellTestToken: Cell;

    beforeEach('createCell', async () => {
      // Create gas token cell
      let tx = await factory.connect(creator).create(
        creator.address,
        tokenURI,
        encryptURL,
        ethers.constants.AddressZero,
        ethers.constants.WeiPerEther.div(10)
      )
      await tx.wait()
      const tokenId0 = await registry.tokenOfOwnerByIndex(creator.address, 0);
      const cellZeroAddr = await factory.tokenId2Cell(tokenId0);
      cellZeroToken = await attachCell(cellZeroAddr);

      // Create 20 token cell
      tx = await factory.connect(creator).create(
        creator.address,
        tokenURI,
        encryptURLLong,
        testToken.address,
        ethers.constants.WeiPerEther
      )
      await tx.wait()
      const tokenId1 = await registry.tokenOfOwnerByIndex(creator.address, 1);
      const cellTestAddr = await factory.tokenId2Cell(tokenId1);
      cellTestToken = await attachCell(cellTestAddr);

      // Mint 20 token to user
      await testToken.mint(user.address, ethers.constants.WeiPerEther.mul(10));
    })

    it('success for gas token', async () => {
      const value = ethers.constants.WeiPerEther.div(10);
      const tx = await cellZeroToken.connect(user).makeRequest("testParams", { value: value });
      await tx.wait()
      expect(await cellZeroToken.counter(user.address)).to.eq(1);
    })

    it('success for 20 token', async () => {
      await testToken.connect(user).approve(cellTestToken.address, ethers.constants.MaxUint256);
      const tx = await cellTestToken.connect(user).makeRequest("testParams");
      await tx.wait()
      expect(await cellTestToken.counter(user.address)).to.eq(1);
    })
  })

})
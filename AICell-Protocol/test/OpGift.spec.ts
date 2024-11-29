import { Wallet, BigNumber } from 'ethers'
import { ethers, network, waffle } from 'hardhat'
import { OpGift } from '../typechain/OpGift'
import { expect } from './shared/expect'
import { opGiftFixture } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe('OpGift', async () => {
  let wallet: Wallet, user: Wallet;

  let opGift: OpGift
  const metadataIpfs = "https://ipfsr.burgerswap.org/ipfs/QmNrvztbU9wnZamb98mdnaNKbg2f3qVbmbxbJFghrBLiMS"

  let loadFixTure: ReturnType<typeof createFixtureLoader>;

  before('create fixture loader', async () => {
    [wallet, user] = await (ethers as any).getSigners()
    loadFixTure = createFixtureLoader([wallet])
  })

  beforeEach('deploy OpGift', async () => {
    ; ({ opGift } = await loadFixTure(opGiftFixture));
  })

  it('check state', async () => {
    expect(await opGift.mintable()).to.eq(true);
    expect(await opGift.metadataIpfs()).to.eq(metadataIpfs)
  })

  describe('#mint', async () => {
    it('success', async () => {
      await opGift.connect(user).mint();
      expect(await opGift.balanceOf(user.address)).to.eq(1)
      expect(await opGift.tokenOfOwnerByIndex(user.address, 0)).to.eq(0)
      expect(await opGift.totalSupply()).to.eq(1)
      expect(await opGift.tokenURI(0)).to.eq(metadataIpfs)
    })

    it('fialed for mint twice', async () => {
      await opGift.connect(user).mint();
      await expect(opGift.connect(user).mint()).to.revertedWith("Each user only mint once.");
    })

    it('failed for mint disactived', async () => {
      await opGift.setMint(false);
      await expect(opGift.connect(user).mint()).to.revertedWith("Mint func is deactivated");
    })
  })

  describe('#burn', async () => {
    it('success', async () => {
      await opGift.connect(user).mint();
      expect(await opGift.balanceOf(user.address)).to.eq(1);
      expect(await opGift.totalSupply()).to.eq(1);
      await opGift.connect(user).burn(0);
      expect(await opGift.balanceOf(user.address)).to.eq(0);
      expect(await opGift.totalSupply()).to.eq(0);
      expect(await opGift.counter()).to.eq(1);
    })
  })
})
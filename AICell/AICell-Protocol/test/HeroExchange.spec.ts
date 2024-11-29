import { Wallet, BigNumber } from 'ethers'
import { ethers, waffle } from 'hardhat'
import { TestERC721 } from '../typechain/TestERC721'
import { TestHeroBox } from '../typechain/TestHeroBox'
import { Hero721 } from '../typechain/Hero721'
import { HeroExchange } from '../typechain/HeroExchange'
import { expect } from './shared/expect'
import { heroExchangeFixture, signHeroBatchExchange, signHeroExchange } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe('HeroExchange', async () => {
  let wallet: Wallet, other: Wallet, user: Wallet;

  let nft0: TestERC721
  let nft1: Hero721
  let heroBox: TestHeroBox
  let heroExchange: HeroExchange

  let loadFixTure: ReturnType<typeof createFixtureLoader>;

  before('create fixture loader', async () => {
    [wallet, other, user] = await (ethers as any).getSigners()
    loadFixTure = createFixtureLoader([wallet, other])
  })

  beforeEach('deploy HeroExchange', async () => {
    ; ({ nft0, nft1, heroBox, heroExchange } = await loadFixTure(heroExchangeFixture));
  })

  it('check state', async () => {
    expect(await nft0.balanceOf(other.address)).to.eq(BigNumber.from(10))
    expect(await nft0.ownerOf(BigNumber.from(1))).to.eq(other.address)
    expect(await nft1.balanceOf(wallet.address)).to.eq(BigNumber.from(1000))
    expect(await nft1.ownerOf(BigNumber.from(1))).to.eq(wallet.address)
  })

  describe('#exchange', async () => {
    it('success for user exchange blue', async () => {
      let tokenId0 = BigNumber.from(1)
      await nft0.connect(other).transferFrom(other.address, user.address, tokenId0)
      await nft0.connect(user).approve(heroExchange.address, tokenId0)
      let quality = BigNumber.from(0)      
      let signature = await signHeroExchange(wallet, tokenId0.toString(), quality.toString(), heroExchange.address)
      await heroExchange.connect(user).exchange(tokenId0, quality, signature)
      expect(await nft0.ownerOf(tokenId0)).to.eq(heroExchange.address)
      expect(await nft1.ownerOf(BigNumber.from(1))).to.eq(user.address)
      expect(await heroExchange.qualityIndex(quality)).to.eq(BigNumber.from(1))
    })

    it('success for user exchange purple', async () => {
      let tokenId0 = BigNumber.from(1)
      await nft0.connect(other).transferFrom(other.address, user.address, tokenId0)
      await nft0.connect(user).approve(heroExchange.address, tokenId0)
      let quality = BigNumber.from(1)      
      let signature = await signHeroExchange(wallet, tokenId0.toString(), quality.toString(), heroExchange.address)
      await heroExchange.connect(user).exchange(tokenId0, quality, signature)
      expect(await nft0.ownerOf(tokenId0)).to.eq(heroExchange.address)
      expect(await nft1.ownerOf(BigNumber.from(701))).to.eq(user.address)
      expect(await heroExchange.qualityIndex(quality)).to.eq(BigNumber.from(1))
    })

    it('success for user exchange orange', async () => {
      let tokenId0 = BigNumber.from(1)
      await nft0.connect(other).transferFrom(other.address, user.address, tokenId0)
      await nft0.connect(user).approve(heroExchange.address, tokenId0)
      let quality = BigNumber.from(2)      
      let signature = await signHeroExchange(wallet, tokenId0.toString(), quality.toString(), heroExchange.address)
      await heroExchange.connect(user).exchange(tokenId0, quality, signature)
      expect(await nft0.ownerOf(tokenId0)).to.eq(heroExchange.address)
      expect(await nft1.ownerOf(BigNumber.from(901))).to.eq(user.address)
      expect(await heroExchange.qualityIndex(quality)).to.eq(BigNumber.from(1))
    })

    it('success for user exchange multi tokenId',async () => {
      let tokenIds0 = [BigNumber.from(1), BigNumber.from(2), BigNumber.from(3), BigNumber.from(4), BigNumber.from(5)]
      await nft0.connect(other).transferFrom(other.address, user.address, BigNumber.from(1))
      await nft0.connect(other).transferFrom(other.address, user.address, BigNumber.from(2))
      await nft0.connect(other).transferFrom(other.address, user.address, BigNumber.from(3))
      await nft0.connect(other).transferFrom(other.address, user.address, BigNumber.from(4))
      await nft0.connect(other).transferFrom(other.address, user.address, BigNumber.from(5))
      await nft0.connect(user).setApprovalForAll(heroExchange.address, true)
      let qualities = [BigNumber.from(0), BigNumber.from(0), BigNumber.from(0), BigNumber.from(1), BigNumber.from(2)]
      let signature = await signHeroBatchExchange(wallet, tokenIds0, qualities, heroExchange.address)
      await heroExchange.connect(user).batchExchange(tokenIds0, qualities, signature)
      expect(await nft0.ownerOf(tokenIds0[1])).to.eq(heroExchange.address)
      expect(await nft1.balanceOf(user.address)).to.eq(BigNumber.from(5))
      expect(await nft1.ownerOf(BigNumber.from(1))).to.eq(user.address)
      expect(await nft1.ownerOf(BigNumber.from(2))).to.eq(user.address)
      expect(await nft1.ownerOf(BigNumber.from(3))).to.eq(user.address)
      expect(await nft1.ownerOf(BigNumber.from(701))).to.eq(user.address)
      expect(await nft1.ownerOf(BigNumber.from(901))).to.eq(user.address)
    })
  })
})
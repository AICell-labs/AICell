import { Wallet, BigNumber } from 'ethers'
import { ethers, waffle } from 'hardhat'
import { TestERC721 } from '../typechain/TestERC721'
import { HeroAirdrop } from '../typechain/HeroAirdrop'
import { expect } from './shared/expect'
import { heroAirdropFixture, makeMerkleTree } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe('HeroAirdrop', async () => {
  let wallet: Wallet, other: Wallet, other1: Wallet;

  let nft0: TestERC721
  let heroAirdrop: HeroAirdrop
  let tokenIds: Array<number>
  let whitelist: Array<string>

  let loadFixTure: ReturnType<typeof createFixtureLoader>;

  before('create fixture loader', async () => {
    [wallet, other, other1] = await (ethers as any).getSigners()
    loadFixTure = createFixtureLoader([wallet, other])
  })

  beforeEach('deploy HeroExchange', async () => {
    ; ({ nft0, heroAirdrop, tokenIds, whitelist } = await loadFixTure(heroAirdropFixture));
  })

  it('check state', async () => {
    expect(await nft0.balanceOf(wallet.address)).to.eq(BigNumber.from(10))
    expect(await nft0.isApprovedForAll(wallet.address, heroAirdrop.address)).to.eq(true)
  })

  describe('#checkWhitelist', async () => {
    it('success for other', async () => {
      let mt = await makeMerkleTree(whitelist)
      let leaf = ethers.utils.solidityKeccak256(['address'], [other.address])
      let proof = mt.tree.getHexProof(leaf)
      expect(await heroAirdrop.connect(other).checkWhiteList(proof)).to.eq(true)
    })

    it('fail for other1', async () => {
      let mt = await makeMerkleTree(whitelist)
      let leaf = ethers.utils.solidityKeccak256(['address'], [other1.address])
      let proof = mt.tree.getHexProof(leaf)
      expect(await heroAirdrop.connect(other1).checkWhiteList(proof)).to.eq(false)
    })
  })

  describe('#claim', async () => {
    it("success for other",async () => {
      let mt = await makeMerkleTree(whitelist)
      let leaf = ethers.utils.solidityKeccak256(['address'], [other.address])
      let proof = mt.tree.getHexProof(leaf)
      await heroAirdrop.connect(other).claim(proof)
      expect(await nft0.balanceOf(other.address)).to.eq(1)
      expect(await nft0.ownerOf(1)).to.eq(other.address)
    })

    it("fails for other claim again",async () => {
      let mt = await makeMerkleTree(whitelist)
      let leaf = ethers.utils.solidityKeccak256(['address'], [other.address])
      let proof = mt.tree.getHexProof(leaf)
      await heroAirdrop.connect(other).claim(proof)
      expect(heroAirdrop.connect(other).claim(proof)).to.revertedWith("Already claimed")
    })

    it("fails for other1 not in whitelist claim",async () => {
      let mt = await makeMerkleTree(whitelist)
      let leaf = ethers.utils.solidityKeccak256(['address'], [other1.address])
      let proof = mt.tree.getHexProof(leaf)
      expect(heroAirdrop.connect(other1).claim(proof)).to.revertedWith("Not in whitelist")
    })
  })
})
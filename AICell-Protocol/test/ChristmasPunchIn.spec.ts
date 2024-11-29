import { Wallet, BigNumber } from 'ethers'
import { ethers, network, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { ChristmasPunchIn } from '../typechain/ChristmasPunchIn'
import { expect } from './shared/expect'
import { christmasPunchInFixture, signChristmasPunchIn } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe('ChristmasPunchIn', async () => {
  let wallet: Wallet, otherA: Wallet, otherB: Wallet;

  let rewardToken: TestERC20
  let punchIn: ChristmasPunchIn
  let rewardAmount = BigNumber.from(100)
  let txId = "test"

  let loadFixTure: ReturnType<typeof createFixtureLoader>;

  before('create fixture loader', async () => {
    [wallet, otherA, otherB] = await (ethers as any).getSigners()
    loadFixTure = createFixtureLoader([wallet])
  })

  beforeEach('deploy PunchIn', async () => {
    ; ({ rewardToken, punchIn } = await loadFixTure(christmasPunchInFixture));
  })

  it('check state', async () => {
    expect(await rewardToken.totalSupply()).to.eq(BigNumber.from(10000))
    expect(await punchIn.owner()).to.eq(wallet.address)
  })

  describe('#punchIn', async () => {
    it('success', async () => {
      await punchIn.connect(otherA).punchIn()
      let userTimestamps = await punchIn.userTimestamps(otherA.address)
      expect(userTimestamps.length).to.eq(1)
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn()
      userTimestamps = await punchIn.userTimestamps(otherA.address)
      expect(userTimestamps.length).to.eq(2)
    })

    it('gas used for punch in', async () => {
      let tx = await punchIn.connect(otherA).punchIn()
      let receipt = await tx.wait()
      console.log("====gas used:", receipt.gasUsed)
    })
  })

  describe('#claim', async () => {
    it('success', async () => {
      let signature = await signChristmasPunchIn(wallet, otherA.address, punchIn.address)
      await punchIn.connect(otherA).claim(otherA.address, signature, txId)
      expect(await punchIn.isUserClaimed(otherA.address)).to.eq(true)
      expect(await rewardToken.balanceOf(otherA.address)).to.eq(rewardAmount)
    })

    it('gas used for claim', async () => {
      let signature = await signChristmasPunchIn(wallet, otherA.address, punchIn.address)
      let tx = await punchIn.connect(otherA).claim(otherA.address, signature, txId)
      let receipt = await tx.wait()
      console.log("====gas used:", receipt.gasUsed)
    })
  })
})
import { Wallet, BigNumber } from 'ethers'
import { ethers, network, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { ActivityPunchIn } from '../typechain/ActivityPunchIn'
import { expect } from './shared/expect'
import { activityPunchInFixture } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe('ActivityPunchIn', async () => {
  let wallet: Wallet, otherA: Wallet, otherB: Wallet;

  let rewardToken: TestERC20
  let punchIn: ActivityPunchIn
  let startTimestamp = BigNumber.from(Date.now()).div(1000)
  let totalAmount = BigNumber.from(3)
  let limitAmount = BigNumber.from(2)
  let rewardAmount = BigNumber.from(100)

  let loadFixTure: ReturnType<typeof createFixtureLoader>;

  before('create fixture loader', async () => {
    [wallet, otherA, otherB] = await (ethers as any).getSigners()
    loadFixTure = createFixtureLoader([wallet])
  })

  beforeEach('deploy PunchIn', async () => {
    ; ({ rewardToken, punchIn } = await loadFixTure(activityPunchInFixture));
  })

  it('check state', async () => {
    expect(await rewardToken.totalSupply()).to.eq(BigNumber.from(10000))
    expect(await punchIn.owner()).to.eq(wallet.address)
  })

  describe('#createActivity', async () => {
    it('failed for wrong timestamp', async () => {
      await expect(punchIn.createActivity(
        startTimestamp.sub(120),
        totalAmount,
        limitAmount,
        rewardAmount,
        rewardToken.address
      )).to.revertedWith("Invalid parameter startTimestamp")
    })

    it('success', async () => {
      await punchIn.createActivity(startTimestamp, totalAmount, limitAmount, rewardAmount, rewardToken.address)
      let activityInfo = await punchIn.activityInfo(BigNumber.from(0))
      expect(activityInfo.endTimestamp).to.eq(startTimestamp.add(totalAmount.mul(86400)))
    })
  })

  describe('#updateActivity', async () => {
    beforeEach('#createActivity', async () => {
      await punchIn.createActivity(startTimestamp, totalAmount, limitAmount, rewardAmount, rewardToken.address)
    })

    it('failed for activity has finished', async () => {
      await network.provider.send('evm_increaseTime', [86400 * 3 + 120])
      await expect(punchIn.updateActivity(
        BigNumber.from(0),
        rewardAmount,
        rewardToken.address
      )).to.revertedWith("Activity has finished")
    })

    it('success', async () => {
      await punchIn.updateActivity(BigNumber.from(0), rewardAmount.add(100), rewardToken.address)
      let activityInfo = await punchIn.activityInfo(BigNumber.from(0))
      expect(activityInfo.rewardAmount).to.eq(rewardAmount.add(100))
    })
  })

  describe('#punchIn', async () => {
    beforeEach('createActivity', async () => {
      await punchIn.createActivity(startTimestamp, totalAmount, limitAmount, rewardAmount, rewardToken.address)
    })

    it('failed for activity has not yet started', async () => {
      await expect(punchIn.connect(otherA).punchIn(BigNumber.from(0))).to.revertedWith("Wrong time for activity")
    })

    it('failed for the activity has already ended', async () => {
      await network.provider.send("evm_increaseTime", [86400 * 4])
      await expect(punchIn.connect(otherA).punchIn(BigNumber.from(0))).to.revertedWith("Wrong time for activity")
    })

    it('failed for punch in twice in one day', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await expect(punchIn.connect(otherA).punchIn(BigNumber.from(0))).to.revertedWith("Already punched in 1 day")
    })

    it('success for userA punch in first time', async () => {
      await network.provider.send("evm_increaseTime", [120]) // Make sure the block.timestamp is greater than startTimestamp.
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      let userAInfo = await punchIn.userInfo(BigNumber.from(0), otherA.address)
      expect(userAInfo[0]).to.gte(startTimestamp)       // lastTimestamp
      expect(userAInfo[1]).to.eq(BigNumber.from(1))     // amount
      expect(userAInfo[2]).to.eq(false)                 // isClaimed
      expect(await punchIn.activitySuccessAmount(BigNumber.from(0))).to.eq(0)
    })

    it('success for userA punch in second time', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 + 120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      let userAInfo = await punchIn.userInfo(BigNumber.from(0), otherA.address)
      expect(userAInfo[1]).to.eq(BigNumber.from(2))
      expect(await punchIn.activitySuccessAmount(BigNumber.from(0))).to.eq(1)
    })

    it('gas used for punch in for first time', async () => {
      await network.provider.send("evm_increaseTime", [120]) // Make sure the block.timestamp is greater than startTimestamp.
      let tx = await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      let receipt = await tx.wait()
      console.log("====gas used:", receipt.gasUsed)
    })

    it('gas used for punch in for second time', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 + 120])
      let tx = await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      let receipt = await tx.wait()
      console.log("====gas used:", receipt.gasUsed)
    })
  })

  describe('#claim', async () => {
    beforeEach('createActivity', async () => {
      await punchIn.createActivity(startTimestamp, totalAmount, limitAmount, rewardAmount, rewardToken.address)
    })

    it('failed for does not meet the conditions', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 * 3 + 120])
      await expect(punchIn.connect(otherA).claim(BigNumber.from(0), otherA.address)).to.revertedWith("The amount of user punch is less than limit amount")
    })

    it('failed for met but activity has not finished', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 + 120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await expect(punchIn.connect(otherA).claim(BigNumber.from(0), otherA.address)).to.revertedWith("The activity is ongoing")
    })

    it('failed for claim twice', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 + 120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 * 2 + 120])
      await punchIn.connect(otherA).claim(BigNumber.from(0), otherA.address)
      await expect(punchIn.connect(otherA).claim(BigNumber.from(0), otherA.address)).to.revertedWith("Already claimed")
    })

    it('success for userA met the conditions', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 + 120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 * 2 + 120])
      let userABalanceBefore = await rewardToken.balanceOf(otherA.address)
      let walletBalanceBefore = await rewardToken.balanceOf(wallet.address)
      await punchIn.connect(otherA).claim(BigNumber.from(0), otherA.address)
      let userABalanceAfter = await rewardToken.balanceOf(otherA.address)
      let walletBalanceAfter = await rewardToken.balanceOf(wallet.address)
      expect(userABalanceAfter.sub(userABalanceBefore)).to.eq(rewardAmount)
      expect(walletBalanceBefore.sub(walletBalanceAfter)).to.eq(rewardAmount)
    })

    it('success for userA && userB met', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await punchIn.connect(otherB).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 + 120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await punchIn.connect(otherB).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 * 2 + 120])
      let userABalanceBefore = await rewardToken.balanceOf(otherA.address)
      let userBBalanceBefore = await rewardToken.balanceOf(otherB.address)
      await punchIn.connect(otherA).claim(BigNumber.from(0), otherA.address)
      await punchIn.connect(otherB).claim(BigNumber.from(0), otherB.address)
      let userABalanceAfter = await rewardToken.balanceOf(otherA.address)
      let userBBalanceAfter = await rewardToken.balanceOf(otherB.address)
      expect(userABalanceAfter.sub(userABalanceBefore)).to.eq(rewardAmount.div(2))
      expect(userBBalanceAfter.sub(userBBalanceBefore)).to.eq(rewardAmount.div(2))
    })

    it('gas used for claim', async () => {
      await network.provider.send("evm_increaseTime", [120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 + 120])
      await punchIn.connect(otherA).punchIn(BigNumber.from(0))
      await network.provider.send("evm_increaseTime", [86400 * 2 + 120])
      let tx = await punchIn.connect(otherA).claim(BigNumber.from(0), otherA.address)
      let receipt = await tx.wait()
      console.log("====gas used:", receipt.gasUsed)
    })
  })
})
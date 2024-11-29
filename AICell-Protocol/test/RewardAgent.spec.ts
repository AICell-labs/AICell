import { Wallet, BigNumber } from 'ethers'
import { ethers, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { RewardAgent } from '../typechain/RewardAgent'
import { BurgerDiamond } from '../typechain/BurgerDiamond'
import { expect } from './shared/expect'
import { rewardAgentFixture, signRewardAgentClaimERC20, signBurgerDiamond } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe('RewardAgent', async () => {
  let wallet: Wallet, otherA: Wallet;

  let rewardToken: TestERC20
  let rewardAgent: RewardAgent
  let burgerDiamond: BurgerDiamond

  let loadFixTure: ReturnType<typeof createFixtureLoader>;

  before('create fixture loader', async () => {
    [wallet, otherA] = await (ethers as any).getSigners()
    loadFixTure = createFixtureLoader([wallet])
  })

  beforeEach('deploy instance', async () => {
    ; ({ rewardToken, rewardAgent, burgerDiamond } = await loadFixTure(rewardAgentFixture));
    await rewardToken.mint(wallet.address, BigNumber.from(10000))
    await rewardToken.approve(rewardAgent.address, ethers.constants.MaxUint256)
  })

  it('check state', async () => {
    expect(await rewardAgent['signer()']()).to.eq(wallet.address)
    expect(await rewardAgent.treasury()).to.eq(wallet.address)
    expect(await burgerDiamond.decimals()).to.eq(0)
  })

  describe('#claimERC20', async () => {
    it('success', async () => {
      // Claim BurgerDiamond
      let claimAmountBD = BigNumber.from(100)
      let orderId = BigNumber.from(123)
      let txIdBDC = "123"
      let signatureBDC = await signBurgerDiamond(wallet, otherA.address, claimAmountBD.toString(), orderId.toString(), txIdBDC, "0", burgerDiamond.address)
      await burgerDiamond.connect(otherA).claim(claimAmountBD, orderId, txIdBDC, signatureBDC)
      console.log("helloworld")
      expect(await burgerDiamond.balanceOf(otherA.address)).to.eq(claimAmountBD)

      // Exchange BurgerDiamond
      let exchangedAmountBD = BigNumber.from(10)
      let contentId = BigNumber.from(124)
      let txIdBDE = "124"
      let signatureBDE = await signBurgerDiamond(wallet, otherA.address, exchangedAmountBD.toString(), contentId.toString(), txIdBDE, "1", burgerDiamond.address)
      await burgerDiamond.connect(otherA).exchange(exchangedAmountBD, contentId, txIdBDE, signatureBDE);
      expect(await burgerDiamond.balanceOf(otherA.address)).to.eq(claimAmountBD.sub(exchangedAmountBD))

      // Claim reward
      let rewardAmountRA = BigNumber.from(100)
      let orderIdRA = BigNumber.from(456)
      let txIdRA = BigNumber.from(456)
      let signatureRA = await signRewardAgentClaimERC20(
        wallet,
        otherA.address,
        rewardToken.address,
        rewardAmountRA.toString(),
        orderIdRA.toString(),
        rewardAgent.address
      )
      await rewardAgent.claimERC20(otherA.address, rewardToken.address, rewardAmountRA, orderIdRA, txIdRA, signatureRA)
      expect(await rewardToken.balanceOf(otherA.address)).to.eq(rewardAmountRA)
    })
  })
})
import { Wallet, BigNumber } from 'ethers'
import { ethers, network, waffle } from 'hardhat'
import { TestERC20 } from '../typechain/TestERC20'
import { Props721 } from '../typechain/Props721'
import { expect } from './shared/expect'
import { props721Fixture, signPropsMint, signPropsBurn } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe('Props721', async () => {
  let wallet: Wallet, otherA: Wallet;

  let consumeToken: TestERC20
  let props721: Props721
  let nowTime = BigNumber.from(Date.now()).div(1000)
  let mintConsumeAmount = BigNumber.from(100)
  let burnConsumeAmount = BigNumber.from(200)

  let loadFixTure: ReturnType<typeof createFixtureLoader>;

  before('create fixture loader', async () => {
    [wallet, otherA] = await (ethers as any).getSigners()
    loadFixTure = createFixtureLoader([wallet])
  })

  beforeEach('deploy Props721', async () => {
    ; ({ consumeToken, props721 } = await loadFixTure(props721Fixture));
    await consumeToken.mint(otherA.address, mintConsumeAmount.add(burnConsumeAmount))
    await consumeToken.connect(otherA).approve(props721.address, BigNumber.from(10000))
  })

  it('check state', async () => {
    expect(await props721.consumeToken()).to.eq(consumeToken.address)
  })

  describe('#mint', async () => {
    it('success', async () => {
      let expiryTime = nowTime.add(86400)
      let orderId = BigNumber.from(111)
      let propId = BigNumber.from(222)
      let signature = await signPropsMint(
        wallet,
        otherA.address,
        expiryTime.toString(),
        orderId.toString(),
        propId.toString(),
        mintConsumeAmount.toString(),
        props721.address
      )
      let balanceBefore = await consumeToken.balanceOf(otherA.address)
      await props721.connect(otherA).mint(expiryTime, orderId, propId, mintConsumeAmount, signature)
      let balanceAfter = await consumeToken.balanceOf(otherA.address)

      expect(await props721.ownerOf(1)).to.eq(otherA.address)
      expect(balanceBefore.sub(balanceAfter)).to.eq(mintConsumeAmount)
    })

    it('fialed for reusing orderId', async () => {
      let expiryTime = nowTime.add(86400)
      let orderId = BigNumber.from(111)
      let propId = BigNumber.from(222)
      let signature = await signPropsMint(
        wallet,
        otherA.address,
        expiryTime.toString(),
        orderId.toString(),
        propId.toString(),
        mintConsumeAmount.toString(),
        props721.address
      )
      await props721.connect(otherA).mint(expiryTime, orderId, propId, mintConsumeAmount, signature)
      await expect(props721.connect(otherA).mint(expiryTime, orderId, propId, mintConsumeAmount, signature)).to.revertedWith("OrderId already exists")
    })
  })

  describe('#burn', async () => {
    it('success', async () => {
      let expiryTime = nowTime.add(86400)
      let orderId = BigNumber.from(111)
      let propId = BigNumber.from(222)
      let signature = await signPropsMint(
        wallet,
        otherA.address,
        expiryTime.toString(),
        orderId.toString(),
        propId.toString(),
        mintConsumeAmount.toString(),
        props721.address
      )
      await props721.connect(otherA).mint(expiryTime, orderId, propId, mintConsumeAmount, signature)
      let tokenId = BigNumber.from(1)
      signature = await signPropsBurn(
        wallet,
        tokenId.toString(),
        burnConsumeAmount.toString(),
        props721.address
      )
      await props721.connect(otherA).burn(tokenId, burnConsumeAmount, signature)
      expect(await props721.balanceOf(otherA.address)).to.eq(0)
      expect(await consumeToken.balanceOf(otherA.address)).to.eq(0)
    })
  })
})
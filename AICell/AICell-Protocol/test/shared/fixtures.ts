import { Wallet } from 'ethers'
import { ethers } from 'hardhat'
import { TestERC20 } from '../../typechain/TestERC20'
import { TestERC721 } from '../../typechain/TestERC721'
import { Registry } from '../../typechain/Registry'
import { Factory } from '../../typechain/Factory'
import { Cell } from '../../typechain/Cell'
import { Fixture } from 'ethereum-waffle'

async function testERC20(): Promise<TestERC20> {
    let factory = await ethers.getContractFactory('TestERC20')
    let token = (await factory.deploy()) as TestERC20
    return token
}

async function testERC721(): Promise<TestERC721> {
    let factory = await ethers.getContractFactory('TestERC721')
    let token = (await factory.deploy()) as TestERC721
    return token
}

interface FactoryFixture {
    testToken: TestERC20
    registry: Registry
    factory: Factory
}

export const factoryFixture: Fixture<FactoryFixture> = async function ([wallet]: Wallet[]): Promise<FactoryFixture> {
    const testToken = await testERC20();
    const registryFactory = await ethers.getContractFactory('Registry');
    const name = "AI Cell"
    const symbol = "AICell"
    const baseURI = ""
    const registry = (await registryFactory.deploy(name, symbol, baseURI)) as Registry;
    const factoryFactory = await ethers.getContractFactory('Factory');
    const feeRate = ethers.constants.WeiPerEther.div(10); // feeRate = 10%
    const factory = (await factoryFactory.deploy(registry.address, wallet.address, feeRate)) as Factory;
    return { testToken, registry, factory }
}

export const attachCell = async function (cellAddr: string): Promise<Cell> {
    const cellFactory = await ethers.getContractFactory('Cell');
    const cell = (await cellFactory.attach(cellAddr)) as Cell;
    return cell;
} 
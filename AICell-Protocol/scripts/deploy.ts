const { ethers, upgrades, network } = require("hardhat");
import {sleep} from "sleep-ts";
import * as fs from 'fs'
import * as path from "path";
let chainId = 0;
let filePath = path.join(__dirname, `.data.json`);
let data: any = {
};
let origdata: any = [
]

async function loadConfig() {
  chainId = await network.provider.send("eth_chainId");
  chainId = Number(chainId);
  let _filePath = path.join(__dirname, `.data.${chainId}.json`);
  if (fs.existsSync(_filePath)) {
    filePath = _filePath;
  }
  console.log('filePath:', filePath);
}

function updateConstructorArgs(name: string, address: string) {
  for (let k in data) {
    for (let i in data[k].constructorArgs) {
      let v = "${" + name + ".address}";
      if (data[k].constructorArgs[i] == v) {
        data[k].constructorArgs[i] = address;
      }
    }
  }
}

async function before() {
  await loadConfig();
  if (fs.existsSync(filePath)) {
    let rawdata = fs.readFileSync(filePath);
    data = JSON.parse(rawdata.toString());
    origdata = JSON.parse(rawdata.toString())
    for (let k in data) {
      if (data[k].address != "") {
        updateConstructorArgs(k, data[k].address);
      }
    }
  }
}

async function after() {
  let content = JSON.stringify(origdata, null, 2);
  fs.writeFileSync(filePath, content);
}

async function deployContract(name: string, value: any) {
  if (data[name].deployed) {
    console.log(`Deploy contract ${name} exits: "${data[name].address}",`)
    return;
  }
  await sleep(100);
  let contractName = name;
  if(data[name].hasOwnProperty('contractName')) {
    contractName = data[name].contractName;
  }
  // console.log('Deploy contract...', contractName, value)
  const Factory = await ethers.getContractFactory(contractName);
  let ins = await Factory.deploy(...value.constructorArgs);
  await ins.deployed();
  origdata[name].address = ins.address;
  origdata[name].deployed = true;
  origdata[name].upgraded = true;
  origdata[name].verified = false;
  console.log(`Deploy contract ${name} new: "${ins.address}",`)
  updateConstructorArgs(name, ins.address);
}

async function deployProxyContract(name: string, value: any) {
  // Deploying
  if (data[name].deployed) {
    console.log(`Deploy proxy contract ${name} exits: "${data[name].address}",`);
    return;
  }
  // console.log('deploy...')
  // await sleep(100);
  let contractName = name;
  if(data[name].hasOwnProperty('contractName')) {
    contractName = data[name].contractName;
  }
  const Factory = await ethers.getContractFactory(contractName);
  const ins = await upgrades.deployProxy(Factory, data[name].constructorArgs);
  await ins.deployed();
  origdata[name].address = ins.address;
  origdata[name].deployed = true;
  origdata[name].upgraded = true;
  origdata[name].verified = false;
  console.log(`Deploy proxy contract ${name} new: "${ins.address}",`)
  updateConstructorArgs(name, ins.address);
}

async function upgradeContract(name: string, value: any) {
  // Upgrading
  if(!data[name].deployed || !data[name].address || data[name].upgraded || !isProxy(data[name])) {
    return
  }
  // console.log('upgrade...', data[name].address)
  let contractName = name;
  if(data[name].hasOwnProperty('contractName')) {
    contractName = data[name].contractName;
  }
  const Factory = await ethers.getContractFactory(contractName);
  const ins = await upgrades.upgradeProxy(data[name].address, Factory);
  origdata[name].address = ins.address;
  origdata[name].deployed = true;
  origdata[name].upgraded = true;
  origdata[name].verified = false;
  console.log(`Upgrade contract ${name} : "${ins.address}",`)
}

async function deploy() {
  console.log("============Start to deploy project's contracts.============");
  for (let k in data) {
    try {
      if(isProxy(data[k])) {
        await deployProxyContract(k, data[k])
      } else {
        await deployContract(k, data[k])
      }
    } catch(e) {
      console.error('deployexcept', k, e)
    }
  }
  console.log("======================Deploy Done!.=====================");
}


async function upgrade() {
  console.log("============Start to upgrade project's contracts.============");
  for (let k in data) {
    try {
      await upgradeContract(k, data[k])
    } catch(e) {
      console.error('upgradeContract except', k, e)
    }
  }
  console.log("======================Upgrade Done!.=====================");
}

function isProxy(item:any) {
  if(item.hasOwnProperty('proxy') && item.proxy) return true;
  return false;
}


async function main() {
  await before();
  await deploy();
  await upgrade();
  await after();
}

main();

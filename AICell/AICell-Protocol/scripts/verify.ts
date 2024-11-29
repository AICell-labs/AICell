import fs from "fs";
import path from "path";
let hre = require("hardhat");
let chainId = 0;
let filePath = path.join(__dirname, `.data.json`);
let data: any = {};
let origdata: any = {}

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
  
async function loadConfig() {
    chainId = await hre.network.provider.send("eth_chainId");
    chainId = Number(chainId);
    let _filePath = path.join(__dirname, `.data.${chainId}.json`);
    if (fs.existsSync(_filePath)) {
      filePath = _filePath;
    }
    console.log('filePath:', filePath);
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

async function verify() {
    console.log("============Start verify contract.============");

    // verify
    for (const ele of Object.keys(data)) {
        if(data[ele].verified){
            continue;
        }
        let addr = data[ele].address
        if(data[ele].upgraded) {
            addr = data[ele].upgradedAddress
        }
        if(!addr){
            continue;
        }
        if(data[ele].proxy) {
          data[ele].constructorArgs = [];
        }
        // console.log('verify:addr',ele, addr, data);
        await hre.run("verify:verify", {
            address: addr,
            constructorArguments: data[ele].constructorArgs,
        })
        origdata[ele].verified = true
    }

    console.log("============Verify contract Done!============");
}

async function main() {
    await before();
    await verify();
    await after();
}

  
main();


# ai-cell-protocol

This repository contains the core smart contracts for the AICell Protocol. 

## Contracts

![Image text](https://github.com/careylzy/ai-cell-protocol/blob/main/contract.png)

### Registry.sol

This is a Cell (ERC721 NFT) Registry contract, allowing users to register their own Cells. Each Cell has tokenURI and encryptURL, the tokenURI is the decentralized link of NFT metadata, the encryptURL is encoded data of the private request path.


### Factory.sol

Creator can call the Factory contract to create a Cell NFT and Cell contract, the Cell contract is created with salt which incloudes the owner address of Cell NFT, the encryptURL and Cell tokenId. The contract also implements a fee mechanism for token creation which can be adjusted by the contract's owner.


### Cell.sol

The Cell contract, created for each NFT, holds the Cell NFT's details, enables setting prices, making requests and withdrawing funds, with an attached fee mechanism. It ensures only the Cell owner could perform certain operations and emits events for transparency.


## Getting Started

### Prerequisites

- yarn

### Installation

```sh
git clone https://github.com/careylzy/AI-Cell-Protocol.git

cd ai-cell-protocol

yarn

cp ./example.hardhat.data.json .hardhat.data.json # Please set up the environment configuration before running.
```

## Usage

### Compile
```sh
yarn compile
```

### Deploy
```sh
cp scripts/data.example.json .data.97.json
```

Config the deploy script
```json
{
	"ownerWallet": {
		"address": "YOUR_WALLET_ADDRESS",
		"constructorArgs": [],
		"upgradedAddress": "",
		"deployed": false,
		"upgraded": false,
		"verified": false
	  }
}
```

```sh
yarn deploy:bsctestnet
```


### Verify

Config the verify script
```json
{
  "ownerWallet": {
    "address": "YOUR_WALLET_ADDRESS",
    "constructorArgs": [],
    "upgradedAddress": "",
    "deployed": true,
    "upgraded": true,
    "verified": true
  },
  "Registry": {
    "address": "REGISTRY_CONTRACT_ADDRESS",
    "constructorArgs": [
      "AICell: Positions NFT",
      "AICell",
      ""
    ],
    "upgradedAddress": "REGISTRY_CONTRACT_ADDRESS",
    "deployed": true,
    "upgraded": true,
    "verified": false
  },
  "Factory": {
    "address": "FACTORY_CONTRACT_ADDRESS",
    "constructorArgs": [
      "${Registry.address}",
      "${ownerWallet.address}",
      "1000000000000000"
    ],
    "upgradedAddress": "FACTORY_CONTRACT_ADDRESS",
    "deployed": true,
    "upgraded": true,
    "verified": false
  }
}
```

```sh
yarn verify:bsctestnet
```

## Running the tests

```sh
yarn test test/Factory.test.ts
```

## Deployed Contracts

### Bsc Testnet
```
Registry: "0x126d972695B13574029082CE1586c7C5596C3A4C"
Factory: "0x6eADA8d543Ae8aF4cD146952a1ccB2FAe697EC5F"
```
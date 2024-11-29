# ai-cell-server

This repository is the server code for the AICell project. The server-side operates as a crucial hub for cell management, facilitating both the creation and invocation phases. It also plays a critical role in third-party call handling, parsing user inputs and returned data effectively. With BNB-Greenfield integration, operational excellency is ensured, as an on-chain evidence system oversees all procedures. This storeroom of functionalities streams together the comprehensive landscape of our project's server component.

![Image text](https://github.com/careylzy/AI-Cell-Server/blob/main/ai-cell.jpg)

## Getting Started

### Prerequisites

- [NodeJs](https://nodejs.org/en/download) (v18.17.0 is better)

- [MongoDB Docker](https://www.mongodb.com/compatibility/docker)

- yarn

### Installation

```sh
git clone https://github.com/careylzy/AI-Cell-Server.git

cd ai-cell-server

yarn

cp ./env.example .env # Please set up the environment configuration before running.
```

## Usage

Dev
```sh
yarn devwww # Run the server in dev mode.
```

Run
```sh
yarn build

node dist/src/www.js
```

## Running the tests

```sh
yarn test tests/cell.test.ts
```


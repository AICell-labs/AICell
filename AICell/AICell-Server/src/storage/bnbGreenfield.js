const { Client, encodeToHexString } = require('@bnb-chain/greenfield-js-sdk');
const { ReedSolomon } = require('@bnb-chain/reed-solomon');
const { APP_ENV } = require("../constants");

class BNBGreenfield {
    constructor(host, port, endpoint, account, privateKey) {
        this.client = Client.create(host, port);
        this.endpoint = endpoint;
        this.bucketName = "ai-cell-test-bucket";
        this.logoFoldName = "fold-logo";
        this.cellFoldName = "fold-cell";
        this.account = account;

        let _privateKey = privateKey;
        this.getPrivateKey = function () {
            return _privateKey;
        }
    }

    async getLastBlock() {
        const latestBlockHeight = await this.client.basic.getLatestBlockHeight();
        return latestBlockHeight;
    }

    async getAccountBalance(account) {
        if (!account) account = this.account;
        const res = await this.client.account.getAccountBalance({
            address: account,
            denom: 'BNB'
        });
        return { denom: res.balance?.denom, amount: res.balance?.amount };
    }

    async transfer(from, privateKey, to, amount) {
        const transferTx = await this.client.account.transfer({
            fromAddress: from,
            toAddress: to,
            amount: [
                {
                    denom: 'BNB',
                    amount: amount,
                },
            ],
        });

        const simulateInfo = await transferTx.simulate({ denom: 'BNB' });

        const res = await transferTx.broadcast({
            denom: 'BNB',
            gasLimit: Number(simulateInfo.gasLimit),
            gasPrice: simulateInfo.gasPrice,
            payer: from,
            granter: '',
            privateKey: privateKey,
        });

        return res;
    }

    async getStorageProviders() {
        const spList = await this.client.sp.getStorageProviders();
        const sp = {
            operatorAddress: spList[0].operatorAddress,
            endpoint: spList[0].endpoint,
        };
        return sp;
    }

    async createBucket(bucketName) {
        const sp = await this.getStorageProviders();

        const createBucketTx = await this.client.bucket.createBucket(
            {
                bucketName: bucketName,
                creator: this.account,
                visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
                chargedReadQuota: '0',
                spInfo: {
                    primarySpAddress: sp.operatorAddress,
                },
                paymentAddress: this.account,
            },
            {
                type: 'ECDSA',
                privateKey: this.getPrivateKey(),
            },
        );

        const createBucketTxSimulateInfo = await createBucketTx.simulate({
            denom: 'BNB',
        });

        const createBucketRes = await createBucketTx.broadcast({
            denom: 'BNB',
            gasLimit: Number(createBucketTxSimulateInfo?.gasLimit),
            gasPrice: createBucketTxSimulateInfo?.gasPrice || '5000000000',
            payer: this.account,
            granter: '',
            privateKey: this.getPrivateKey(),
        });

        return createBucketRes;
    }

    async getBucketMeta(bucketName) {
        const bucketInfo = await this.client.bucket.getBucketMeta({ bucketName });
        return bucketInfo;
    }

    async listBuckets(account) {
        if (!account) account = this.account;
        const res = await this.client.bucket.listBuckets({
            address: account,
            endpoint: this.endpoint
        });
        return res;
    }

    async listBucketsByIds(bucketIds) {
        const res = await this.client.bucket.listBucketsByIds({ ids: bucketIds });
        return res;
    }

    async createFold(bucketName, fileName) {
        const createFoldTx = await this.client.object.createFolder({
            bucketName: bucketName,
            objectName: fileName + '/',
            creator: this.account,
        }, {
            type: 'ECDSA',
            privateKey: this.getPrivateKey(),
        });

        const createFoldTxSimulateInfo = await createFoldTx.simulate({ denom: 'BNB' });

        const createFoldtRes = await createFoldTx.broadcast({
            denom: 'BNB',
            gasLimit: Number(createFoldTxSimulateInfo?.gasLimit),
            gasPrice: createFoldTxSimulateInfo?.gasPrice || '5000000000',
            payer: this.account,
            granter: '',
            privateKey: this.getPrivateKey(),
        });

        return createFoldtRes;
    }

    async createObject(bucketName, fileName, fileBuffer, fileType, foldName) {
        const rs = new ReedSolomon();
        const expectCheckSums = await rs.encode(Uint8Array.from(fileBuffer));

        let objectName = fileName;
        if (foldName) {
            objectName = foldName + '/' + fileName;
        }
        const createObjectTx = await this.client.object.createObject({
            bucketName: bucketName,
            objectName: objectName,
            creator: this.account,
            visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
            fileType: fileType,
            redundancyType: 'REDUNDANCY_EC_TYPE',
            contentLength: fileBuffer.length,
            expectCheckSums: expectCheckSums,
        }, {
            type: 'ECDSA',
            privateKey: this.getPrivateKey(),
        });

        const createObjectTxSimulateInfo = await createObjectTx.simulate({ denom: 'BNB' });

        const createObjectRes = await createObjectTx.broadcast({
            denom: 'BNB',
            gasLimit: Number(createObjectTxSimulateInfo?.gasLimit),
            gasPrice: createObjectTxSimulateInfo?.gasPrice || '5000000000',
            payer: this.account,
            granter: '',
            privateKey: this.getPrivateKey(),
        });

        let objectId;
        for (let i = 0; i < createObjectRes.events.length; i++) {
            const event = createObjectRes.events[i];
            if (event.type == "greenfield.storage.EventCreateObject") {
                for (let j = 0; j < event.attributes.length; j++) {
                    if (event.attributes[j].key == "object_id") {
                        const objectIdInt = parseInt(event.attributes[j].value.replace(/"/g, '')).toString(16);
                        console.log(objectIdInt)
                        objectId = '0x' + objectIdInt.padStart(64, '0')
                    }
                }
            }
        }

        await this.client.object.uploadObject({
            bucketName: bucketName,
            objectName: objectName,
            body: fileBuffer,
            txnHash: createObjectRes.transactionHash,
        }, {
            type: 'ECDSA',
            privateKey: this.getPrivateKey(),
        });

        let url;
        if (foldName) {
            url = `https://sp.web3go.xyz/view/${bucketName}/${foldName}/${fileName}`
        } else {
            url = `https://sp.web3go.xyz/view/${bucketName}/${fileName}`
        }

        return { txhash: createObjectRes.transactionHash, objectId: objectId, url: url };
    }

    async listObjects(bucketName) {
        const res = await this.client.object.listObjects({
            bucketName,
            endpoint: this.endpoint
        });
        return res;
    }

    async listObjectsByIds(ids) {
        const res = await this.client.object.listObjectsByIds({ ids: ids });
        return res.body?.GfSpListObjectsByIDsResponse.ObjectEntry;
    }
}

const bnbGreenfield = new BNBGreenfield(
    APP_ENV.BNB_GREENFIELD.HOST,
    APP_ENV.BNB_GREENFIELD.PORT,
    APP_ENV.BNB_GREENFIELD.ENDPOINTS,
    APP_ENV.BNB_GREENFIELD.ACCOUNT,
    APP_ENV.BNB_GREENFIELD.PRIVATE_KEY
);

module.exports = bnbGreenfield;

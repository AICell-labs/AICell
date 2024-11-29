import { Client } from '@bnb-chain/greenfield-js-sdk';
import { ReedSolomon } from '@bnb-chain/reed-solomon';
import { DeliverTxResponse } from "@cosmjs/stargate";
import { APP_ENV } from "../constants"

class BNBGreenfieldDev {
    public client: Client;
    public endpoint: string;
    public bucketName: string = "ted-test-bucket"; // ai-cell
    public metadataBucketName: string = "ai-cell-metadata"
    private _account: string;
    private _privateKey: string;

    constructor(
        host: string,
        port: string,
        endpoint: string,
        account: string,
        privateKey: string
    ) {
        // console.log(host)
        this.client = Client.create(host, port);
        this.endpoint = endpoint;
        this._account = account;
        this._privateKey = privateKey;
    }

    async getLastBlock(): Promise<number> {
        const latestBlockHeight = await this.client.basic.getLatestBlockHeight()
        return latestBlockHeight
    }

    async getAccountBalance(account: string): Promise<Object> {
        if (!account) account = this._account;
        const res = await this.client.account.getAccountBalance({
            address: account,
            denom: 'BNB'
        })
        return { denom: res.balance?.denom, amount: res.balance?.amount }
    }

    async transfer(from: string, privateKey: string, to: string, amount: string): Promise<DeliverTxResponse> {
        // construct tx
        const transferTx = await this.client.account.transfer({
            fromAddress: from,
            toAddress: to,
            amount: [
                {
                    denom: 'BNB',
                    amount: amount,
                },
            ],
        })

        // simulate transfer tx
        const simulateInfo = await transferTx.simulate({
            denom: 'BNB',
        });

        // broadcast transfer tx
        const res = await transferTx.broadcast({
            denom: 'BNB',
            gasLimit: Number(simulateInfo.gasLimit),
            gasPrice: simulateInfo.gasPrice,
            payer: from,
            granter: '',
            privateKey: privateKey,
        })

        return res;
    }

    async getStorageProviders(): Promise<string> {
        // get storage providers list
        const sps = await this.client.sp.getStorageProviders()

        // choose the first up to be the primary SP
        const primarySP = sps[0].operatorAddress;

        return primarySP;
    }

    async createBucket(bucketName: string): Promise<DeliverTxResponse> {
        // choose the first up to be the primary SP
        const primarySP = await this.getStorageProviders();

        const createBucketTx = await this.client.bucket.createBucket(
            {
                bucketName: bucketName,
                creator: this._account,
                visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
                chargedReadQuota: '0',
                spInfo: {
                    primarySpAddress: primarySP,
                },
                paymentAddress: this._privateKey,
            },
            {
                type: 'ECDSA',
                privateKey: this._privateKey,
            },
        );

        const createBucketTxSimulateInfo = await createBucketTx.simulate({
            denom: 'BNB',
        });

        const createBucketRes = await createBucketTx.broadcast({
            denom: 'BNB',
            gasLimit: Number(createBucketTxSimulateInfo?.gasLimit),
            gasPrice: createBucketTxSimulateInfo?.gasPrice || '5000000000',
            payer: this._account,
            granter: '',
            privateKey: this._privateKey,
        });

        return createBucketRes;
    }

    async getBucketMeta(bucketName: string): Promise<any> {
        const bucketInfo = await this.client.bucket.getBucketMeta({
            bucketName,
        });
        return bucketInfo;
    }

    async listBuckets(account: string): Promise<any> {
        if (!account) account = this._account;
        const res = await this.client.bucket.listBuckets({
            address: account,
            endpoint: this.endpoint
        });
        return res
    }

    async listBucketsByIds(bucketIds: Array<string>): Promise<any> {
        const res = await this.client.bucket.listBucketsByIds({
            ids: bucketIds
        });
        return res;
    }

    async createFold(bucketName: string, fileName: string): Promise<DeliverTxResponse> {
        const createFoldTx = await this.client.object.createFolder(
            {
                bucketName: bucketName,
                objectName: fileName + '/',
                creator: this._account,
            },
            {
                type: 'ECDSA',
                privateKey: this._privateKey,
            },
        );

        const createFoldTxSimulateInfo = await createFoldTx.simulate({
            denom: 'BNB',
        });

        const createFoldtRes = await createFoldTx.broadcast({
            denom: 'BNB',
            gasLimit: Number(createFoldTxSimulateInfo?.gasLimit),
            gasPrice: createFoldTxSimulateInfo?.gasPrice || '5000000000',
            payer: this._account,
            granter: '',
            privateKey: this._privateKey,
        });

        return createFoldtRes;
    }

    async createObject(
        bucketName: string,
        fileName: string,
        fileBuffer: Buffer,
        fileType: string = 'json',
        foldName?: string
    ): Promise<any> {
        const rs = new ReedSolomon();
        const expectCheckSums = await rs.encode(Uint8Array.from(fileBuffer));

        let objectName = fileName;
        if (foldName) {
            objectName = foldName + '/' + fileName;
        }
        const createObjectTx = await this.client.object.createObject(
            {
                bucketName: bucketName,
                objectName: objectName,
                creator: this._account,
                visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
                fileType: fileType,
                redundancyType: 'REDUNDANCY_EC_TYPE',
                contentLength: fileBuffer.length,
                expectCheckSums: expectCheckSums,
            },
            {
                type: 'ECDSA',
                privateKey: this._privateKey,
            },
        );

        const createObjectTxSimulateInfo = await createObjectTx.simulate({
            denom: 'BNB',
        });

        const createObjectRes = await createObjectTx.broadcast({
            denom: 'BNB',
            gasLimit: Number(createObjectTxSimulateInfo?.gasLimit),
            gasPrice: createObjectTxSimulateInfo?.gasPrice || '5000000000',
            payer: this._account,
            granter: '',
            privateKey: this._privateKey,
        });

        // Convert the Buffer to a File
        const mimeType = 'application/json';
        const blob = new Blob([fileBuffer], { type: mimeType });
        const file = new File([blob], fileName, { type: mimeType });

        const uploadRes = await this.client.object.uploadObject(
            {
                bucketName: bucketName,
                objectName: objectName,
                body: file,
                txnHash: createObjectRes.transactionHash,
            },
            {
                type: 'ECDSA',
                privateKey: this._privateKey,
            }
        );

        console.log(createObjectRes.transactionHash);
        console.log(createObjectRes.msgResponses)

        return { createObjectRes, uploadRes }
    }

    async listObjects(bucketName: string): Promise<any> {
        const res = await this.client.object.listObjects({
            bucketName,
            endpoint: this.endpoint
        });
        return res;
    }

    async listObjectsByIds(ids: Array<string>): Promise<any> {
        const res = await this.client.object.listObjectsByIds({
            ids: ids,
        });
        return res.body?.GfSpListObjectsByIDsResponse.ObjectEntry;
    }
}

const bnbGreenfieldDev = new BNBGreenfieldDev (
    APP_ENV.BNB_GREENFIELD.HOST,
    APP_ENV.BNB_GREENFIELD.PORT,
    APP_ENV.BNB_GREENFIELD.ENDPOINTS,
    APP_ENV.BNB_GREENFIELD.ACCOUNT,
    APP_ENV.BNB_GREENFIELD.PRIVATE_KEY
);

export default bnbGreenfieldDev;
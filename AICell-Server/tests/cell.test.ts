import { mongodb } from '../src/db/mongo';
import assert from 'assert';
import { cellsService } from '../src/services/cells';
import aes from '../src/encryption/aes';

describe('Cell', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {
            console.log('before');
            await mongodb.connect();
        });

        after(async () => {
            mongodb.close();
        });

        it.only('creat index', async () => {
            res = await cellsService.createIndex();
        });

        it('save', async () => {
            const params = {
                owner: '0xef6191a5c8e983da45dac2a787d49fe3f2b6d54e',
                name: 'translate local',
                description: 'translate',
                requestType: 'POST',
                requestHeaders: undefined,
                requestParams: { text: '' },
                price: '10000000000000000',
                denom: '0x0000000000000000000000000000000000000000',
                logoFile: 'https://sp.web3go.xyz/view/ai-cell-test-bucket/fold-logo/1706690796622_ishot_2024-01-31_16.36.51.png',
            };
            const result = await cellsService.insertOne(params);
            console.log('result', result.uid);
        });
        it('aes', async () => {
            const encryptURL = aes.encrypt('https://api.aicell.world/v1/ai/text-to-en');
            console.log('aes', encryptURL);
        });
    });
});

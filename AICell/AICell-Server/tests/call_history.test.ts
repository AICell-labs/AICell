import { mongodb } from '../src/db/mongo';
import assert from 'assert';
import { callHistoryService } from '../src/services/call_history';
import aes from '../src/encryption/aes';

describe('CellHistory', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {
            console.log('before');
            await mongodb.connect();
        });

        after(async () => {
            mongodb.close();
        });

        it('creat index', async () => {
            res = await callHistoryService.createIndex();
        });
    });
});

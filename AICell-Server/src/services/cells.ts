import { mongodb } from '../db/mongo';
import { Document } from 'bson';
import { BaseService } from './base';
import { v4 } from 'uuid';
import { uniq } from 'lodash';

class CellsService extends BaseService {
    async createIndex(): Promise<Document> {
        try {
            await mongodb.dba.createIndex(this.table, { name: 1 }, { unique: false, name: 'idx_name' });
            await mongodb.dba.createIndex(this.table, { created_at: -1 }, { unique: false, name: 'idx_created_at' });
            await mongodb.dba.createIndex(this.table, { cellId: 1 }, { unique: true, name: 'idx_cell_id' });
        } catch (e) {
        } finally {
            return await this.indexInformation();
        }
    }

    async insertOne(data: any): Promise<any> {
        data['cellId'] = v4().replace(/-/g, '');
        return await super.insertOne(data);
    }

    async populateCellId(ids: string[]): Promise<any[]> {
        if (!ids.length) return [];
        const filter = { cellId: { $in: uniq(ids) } };
        return await super.findAll(filter);
    }
}

export const cellsService = new CellsService('cells', 'created_at', 'updated_at');

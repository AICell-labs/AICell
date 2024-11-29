import { MongoClient, Db } from 'mongodb';
import { APP_ENV } from '../constants';
import type { APP_ENV_MONGODB_TYPE } from '../constants';
import path from 'path';

export class MongoDB extends MongoClient {
    public conf: APP_ENV_MONGODB_TYPE;
    public dba: Db;
    constructor(conf: APP_ENV_MONGODB_TYPE) {
        let url = `mongodb://${conf.HOST}:${conf.PORT}/${conf.DB}`;
        console.log('MongoDB url', url);
        const option: any = {};
        if (conf.SSLCA) {
            // mongodb://defidb:<insertYourPassword>@docdb-2023-03-16-07-30-27.cluster-cmr5bhdpfbxj.ap-southeast-1.docdb.amazonaws.com:27017/?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
            const ca = path.join(__dirname, '../../' + conf.SSLCA);
            url = `mongodb://${conf.USER}:${conf.PASSWORD}@${conf.HOST}:${conf.PORT}/${conf.DB}?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;
            option.tlsCAFile = ca;
        } else if (conf.USER && conf.PASSWORD) {
            url = `mongodb://${conf.USER}:${conf.PASSWORD}@${conf.HOST}:${conf.PORT}/${conf.DB}`;
        }

        super(url, option);
        this.conf = conf;
        this.dba = this.db(this.conf.DB);
        console.log(this.options.metadata);
    }
}

export const mongodb = new MongoDB(APP_ENV.MONGODB);

import dotenv from 'dotenv';
dotenv.config();

export type APP_ENV_MONGODB_TYPE = {
    HOST: string;
    PORT: string;
    DB: string;
    USER: string;
    PASSWORD: string;
    SSLCA: string | undefined;
};

export type BNB_GREENFIELD_TYPE = {
    HOST: string;
    PORT: string;
    ENDPOINTS: string;
    ACCOUNT: string;
    PRIVATE_KEY: string;
};

export type APP_ENV_TYPE = {
    PORT: string;
    MONGODB: APP_ENV_MONGODB_TYPE;
    BNB_GREENFIELD: BNB_GREENFIELD_TYPE
}

export const APP_ENV: APP_ENV_TYPE = {
    PORT: process.env.PORT + '',
    MONGODB: {
        HOST: process.env.MONGODB_HOST + '',
        PORT: process.env?.MONGODB_PORT ? process.env.MONGODB_PORT + '' : '27017',
        DB: process.env.MONGODB_DB + '',
        USER: process.env.MONGODB_USER + '',
        PASSWORD: process.env.MONGODB_PASSWORD + '',
        SSLCA: process.env?.MONGODB_SSLCA
    },
    BNB_GREENFIELD: {
        HOST: process.env.BNBGREENFIEL_HOST + '',
        PORT: process.env.BNBGREENFIEL_PORT + '',
        ENDPOINTS: process.env.BNBGREENFIEL_ENDPOINT + '',
        ACCOUNT: process.env.BNBGREENFIELD_ACCOUNT_ADDRESS + '',
        PRIVATE_KEY: process.env.BNBGREENFIELD_ACCOUNT_PRIVATEKEY + ''
    }
};

export const AES_SECRET_KEY: string = process.env.AES_SECRET_KEY + '';

export const OPEN_AI_KEY: string = process.env.OPENAI_API_KEY + '';

export const MIDJOURNEY_PROXY_URL: string = process.env.MIDJOURNEY_PROXY_URL + '';

export enum MIDJOURNEY_MODE {
    FAST,
    RELAX,
}

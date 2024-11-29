import express, { Express } from 'express';
import { APP_ENV } from './constants';
import fileUpload from 'express-fileupload';

const app: Express = express();
const port = APP_ENV.PORT;
app.use(express.urlencoded({ extended: false, limit: '100mb' }));
app.use(express.json({ limit: '100mb' }));
app.use(fileUpload({ createParentPath: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Origin', `${req.headers.origin || '*'}`);
    res.header('Access-Control-Allow-Headers', 'Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,X-Data-Type,X-Requested-With,X-Data-Type,X-Auth-Token,X-chainid,X-GATEWAY-API-KEY');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.setTimeout(100000000, () => {
        res.status(408);
    });
    req.method === 'OPTIONS' ? res.status(204).end() : next();
});

import CellRouters from './routers/cell';
import AIRouters from './routers/ai';

app.use('/v1/cell', CellRouters);
app.use('/v1/ai', AIRouters);

app.listen(port, async () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

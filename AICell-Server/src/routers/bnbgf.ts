import { Router } from 'express';
import Result from '../utils/result';
import bnbGreenfield from '../storage/bnb-greenfield'

const router: Router = Router();

type CellMetaData = {
  owner: string;              // "nft_owner_account_address"
  requestAuthorUrl: string;   // "third_ai_platform_author_url"
  requestPlatform: string;    // "third_platform_name"
  requestPlatformUrl: string; // "third_platform_url"
  requestType: string;        // "GET/POST"
  requestHeaders: Object;     // { "Content-Type": "xxx", "Accept-Encoding": "xxx" }
  requestParams: Object;      // { "param-a": "xxx", "param-b": "xxx", "param-c-op": "xxx" }
  price: string;              // '0.001'
  tokenAddress: string        // "0xaaaaaaaaa",
}

function isValidCellMetaData(obj: any): obj is CellMetaData {
  return typeof obj.owner === 'string' &&
    typeof obj.requestAuthorUrl === 'string' &&
    typeof obj.requestPlatform === 'string' &&
    typeof obj.requestPlatformUrl === 'string' &&
    (obj.requestType === 'GET' || obj.requestType === 'POST') &&
    typeof obj.requestHeaders === 'object' &&
    !Array.isArray(obj.requestHeaders) && // 确保不是数组
    typeof obj.requestParams === 'object' &&
    !Array.isArray(obj.requestParams) && // 确保不是数组
    typeof obj.price === 'string' &&
    typeof obj.tokenAddress === 'string';
}

router.post('/create-object', async (req: any, res) => {
  try {
    if (!req.body.metadata || !req.body.ownedTokenLength) {
      res.send(Result.fail("Invalid params"));
    }
    console.log(isValidCellMetaData(req.body.metadata))

    const fileName = req.body.metadata.tokenAddress + '_' + req.body.ownedTokenLength + '_' + req.body.metadata.owner + '.json';
    let createRes = await bnbGreenfield.createObject(
      bnbGreenfield.bucketName,
      fileName,
      Buffer.from(JSON.stringify(req.body.metadata), 'utf-8')
    )

    res.send(Result.success(createRes))
  } catch (e: any) {
    res.send(Result.err(500, e.message || String(e)));
  }
});

export default router;
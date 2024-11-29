import { Router } from 'express';
import Result from '../utils/result';
import { translateToEn } from '../ai-services/openai';
import { imagine, fetch, ImagineParams, ImagineRes, StatusFetchSuccess } from "../ai-services/midjourney"
import { MIDJOURNEY_MODE } from '../constants'
import { sleep } from '../utils/util'

const router: Router = Router();

router.post('/text-to-en', async (req: any, res) => {
  try {
    const { original_text } = req.body;
    const text = original_text;
    const result = await translateToEn(text)
    res.send(Result.success(result))
  } catch (e: any) {
    res.send(Result.err(500, e.message || String(e)));
  }
});

router.post('/text-to-en-dev', async (req: any, res) => {
  try {
    const { original_text } = req.body;
    const text = original_text;
    const result = await translateToEn(text)
    res.send(Result.success(result))
  } catch (e: any) {
    res.send(Result.err(500, e.message || String(e)));
  }
});

router.post('/image-gen', async (req: any, res) => {
  try {
    const { description } = req.body;
    const text = description;
    const param: ImagineParams = {
      prompt: text,
      base64Array: [],
      notifyHook: "",
      state: ""
    }
    let imageRes: ImagineRes = await imagine(param, MIDJOURNEY_MODE.FAST);
    for (let i = 0; i < 15; i++) {
      await sleep(3000);
      let fetchRes = await fetch(imageRes.result);
      if (fetchRes.status == StatusFetchSuccess) {
        res.send(Result.success(fetchRes.imageUrl));
        return;
      }
    }
    res.send(Result.fail("Sorry, create image failed."))
  } catch (e: any) {
    res.send(Result.err(500, e.message || String(e)));
  }
});

router.post('/image-gen-dev', async (req: any, res) => {
  try {
    const { description } = req.body;
    const text = description;
    const param: ImagineParams = {
      prompt: text,
      base64Array: [],
      notifyHook: "",
      state: ""
    }
    let imageRes: ImagineRes = await imagine(param, MIDJOURNEY_MODE.FAST);
    for (let i = 0; i < 15; i++) {
      await sleep(3000);
      let fetchRes = await fetch(imageRes.result);
      if (fetchRes.status == StatusFetchSuccess) {
        res.send(Result.success(fetchRes.imageUrl));
      }
    }
    res.send(Result.fail("Sorry, create image failed."))
  } catch (e: any) {
    res.send(Result.err(500, e.message || String(e)));
  }
});

export default router;
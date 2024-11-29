import { Router } from 'express';
import Result from '../utils/result';
import aes from '../encryption/aes'

const router: Router = Router();

router.get('/get-encrypt', async (req: any, res) => {
    try {
        if (!req.body.url) {
            res.send(Result.fail("Invalid params."))
        }
        const encrypted = aes.encrypt(req.body.url)
        res.send(Result.success(encrypted))
    } catch (e: any) {
        res.send(Result.err(500, e.message || String(e)));
    }
});

export default router;
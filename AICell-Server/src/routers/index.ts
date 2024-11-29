import express, { Router } from 'express';
import Result from '../utils/result';

const router: Router = Router();

router.get('/', async (req: any, res) => {
    res.send(Result.success());
});

export default router;

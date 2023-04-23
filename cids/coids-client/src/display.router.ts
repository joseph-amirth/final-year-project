import express, { Request, Response, Router } from 'express';
import { getCollection } from './mongodb.js';

export const displayRouter: Router = express.Router();

displayRouter.get('/', async (request: Request, response: Response) => {
    response.send('Display server working');
});

displayRouter.get('/anomalies', async (request: Request, response: Response) => {
    const anomalies = await getCollection('anomalies').find({}).toArray();
    response.render('display_anomalies', { data: anomalies });
});

displayRouter.get('/intrusions', async (request: Request, response: Response) => {
    const intrusions = await getCollection('intrusions').find({}).toArray();
    response.render('display_intrusions', { data: intrusions });
});

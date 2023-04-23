import express, { Request, Response, Router } from 'express';
import { getCollection } from './mongodb.js';

export const informRouter: Router = express.Router();

informRouter.get('/', async (request: Request, response: Response) => {
    response.send('Intrusion detection server working');
});

informRouter.post('/anomaly', async (request: Request, response: Response) => {
    getCollection('anomalies').insertOne(request.body);
    response.send('Anomaly information received');
});

informRouter.post('/intrusion', async (request: Request, response: Response) => {
    getCollection('intrusions').insertOne(request.body);
    response.send('Intrusion information received');
});

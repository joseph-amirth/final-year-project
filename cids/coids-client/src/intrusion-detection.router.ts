import express, { Request, Response, Router } from 'express';

import { getGateway } from './gateway.js';
import { } from './local-model-add.js';
import { infoln, errorln, successln } from './utils.js';

const gateway = await getGateway();

const network = await gateway.getNetwork('mychannel');

const contract = await network.getContract('basic', 'LocalModelAddContract');

const intrusions: any[] = [];

export const intrusionDetectionRouter: Router = express.Router();

intrusionDetectionRouter.get('/', async (request: Request, response: Response) => {
    const msg = 'Intrusion detection server working';
    infoln(msg);
    response.send(msg);
});

intrusionDetectionRouter.post('/detect', async (request: Request, response: Response) => {
    intrusions.push(request.body);
    response.send('Intrusion information received');
});

intrusionDetectionRouter.get('/display', async (request: Request, response: Response) => {
    response.render('display_intrusions', { data: intrusions });
});


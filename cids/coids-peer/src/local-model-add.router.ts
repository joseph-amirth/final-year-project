import express, { Request, Response, Router } from 'express';

import { getGateway } from './gateway.js';
import { addLocalModel, getLocalModels, popLocalModels } from './local-model-add.js';
import { infoln, errorln, successln } from './utils.js';

const gateway = await getGateway();

const network = await gateway.getNetwork('mychannel');

const contract = await network.getContract('basic', 'LocalModelAddContract');

export const localModelAddRouter: Router = express.Router();

localModelAddRouter.get('/', async (request: Request, response: Response) => {
    response.send('LocalModelAdd API works!');
});

localModelAddRouter.post('/add', async (request: Request, response: Response) => {
    const prevCID: string = request.body.prevCID;
    const CID: string = request.body.CID;
    await addLocalModel(contract, prevCID, CID);
    response.send('Added local model.');
});

localModelAddRouter.get('/get', async (request: Request, response: Response) => {
    const localModels = await getLocalModels(contract);
    response.send(JSON.stringify(localModels));
});

localModelAddRouter.get('/pop', async (request: Request, response: Response) => {
    const localModels = await popLocalModels(contract);
    response.send(JSON.stringify(localModels));
});


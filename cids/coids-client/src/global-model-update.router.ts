import express, { Request, Response, Router } from 'express';

import { getGateway } from './gateway.js';
import { updateGlobalModelCID, updateGlobalModel, getGlobalModelCID, getGlobalModel } from './global-model-update.js';

const gateway = await getGateway();

const network = gateway.getNetwork('mychannel');

const contract = network.getContract('basic', 'GlobalModelUpdateContract');

export const globalModelUpdateRouter: Router = express.Router();

globalModelUpdateRouter.get('/', (_, response: Response) => {
    response.send('GlobalModelUpdate API works!');
});

globalModelUpdateRouter.post('/updateCID', async (request: Request, response: Response) => {
    const CID: string = request.body.CID;
    await updateGlobalModelCID(contract, CID);
    response.send('Updated global model.');
});

globalModelUpdateRouter.post('/update', async (request: Request, response: Response) => {
    const modelStr: string = request.body.model;
    const CID: string = await updateGlobalModel(contract, modelStr);
    response.send(`Updated global model. CID: ${CID}`);
});

globalModelUpdateRouter.get('/getCID', async (_, response: Response) => {
    const CID: string = await getGlobalModelCID(contract);
    response.send(CID);
});

globalModelUpdateRouter.get('/get', async (_, response: Response) => {
    const modelStr: string = await getGlobalModel(contract);
    response.send(modelStr);
});


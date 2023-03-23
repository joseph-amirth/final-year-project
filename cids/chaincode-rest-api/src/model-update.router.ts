import express, { Request, Response, Router } from 'express';

import { getGateway } from './gateway.js';
import { updateModel, getModel } from './model-update.js';
import { infoln, errorln, successln } from './utils.js';

const gateway = await getGateway();

const network = await gateway.getNetwork('mychannel');

const contract = await network.getContract('basic', 'ModelUpdateContract');

export const modelUpdateRouter: Router = express.Router();

modelUpdateRouter.get('/', async (request: Request, response: Response) => {
    response.send('Model update API works!');
});

modelUpdateRouter.post('/intrusion', async(request: Request, response: Response) => {
    const intrusionInfo = request.body.info;
    errorln('\n--> Intrusion detected');
    errorln('*** Intrusion parameters:');
    
    for (const paramName of Object.keys(request.body)) {
        errorln(`*** ${paramName}: ${request.body[paramName]}`);
    }

    response.send('Intrusion information received');
});

modelUpdateRouter.post('/update', async (request: Request, response: Response) => {
    const modelStr: string = request.body.model;
    const cid: string = await updateModel(contract, modelStr);
    response.send(`Updated model with CID: ${cid}`);
});

modelUpdateRouter.get('/get', async (request: Request, response: Response) => {
    const modelStr: string = await getModel(contract);
    response.send(modelStr);
});


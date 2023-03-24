import express, { Request, Response, Router } from 'express';

import { getGateway } from './gateway.js';
import { updateModel, getModel } from './model-update.js';
import { infoln, errorln, successln } from './utils.js';

const gateway = await getGateway();

const network = await gateway.getNetwork('mychannel');

const contract = await network.getContract('basic', 'ModelUpdateContract');

const intrusions = new Array();


export const modelUpdateRouterUI: Router = express.Router();

modelUpdateRouterUI.get('/', async (request: Request, response: Response) => {
    console.log("working");
    response.send('Model update router UI API works!');
});

modelUpdateRouterUI.post('/detect', async(request: Request, response: Response) => {

    let new_intrusion = new Map();
    for (const paramName of Object.keys(request.body)) {
            new_intrusion.set(paramName,request.body[paramName]);
    }

    intrusions.push(request.body);
    response.send('Intrusion information received');
});

modelUpdateRouterUI.get('/display', async (request: Request, response: Response) => {

    response.render('display_intrusions',{data:intrusions});
});



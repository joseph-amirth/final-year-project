import { randomInt } from 'crypto';
import express, { Request, Response, Router } from 'express';
import axios from 'axios';

import { peers, whoami } from './peers.js';
import { performAggregation } from './aggregation.js';
import { errorln, infoln, successln } from './utils.js';

export const leaderElectionRouter: Router = express.Router();

leaderElectionRouter.get('/', (request: Request, response: Response) => {
    for (const peer of peers) {
        axios.get(`http://${peer}:3000/leaderelection/initiate`);
        infoln(`[Sent Init Request]: to ${peer}`);
    }
    response.send('Leader election initiated');
});

let peersAndIds: [string, number][] = []

leaderElectionRouter.get('/initiate', (request: Request, response: Response) => {
    response.send('Leader election initiated');

    const id = randomInt(10000);
    infoln(`[Initiating leader election]: Random ID = ${id}`);

    for (const peer of peers) {
        axios.post(`http://${peer}:3000/leaderelection/postid`, {
            peer: whoami,
            id: id
        });
        infoln(`[Sent ID]: ${id} to ${peer}`);
    }

    setTimeout(terminate, 10000);
});

leaderElectionRouter.post('/postid', (request: Request, response: Response) => {
    const peer: string = request.body.peer;
    const id: number = parseInt(request.body.id);

    peersAndIds.push([peer, id]);
    response.send('ID received');

    infoln(`[Received ID]: ${id} from ${peer}`);
});

function terminate() {
    if (peersAndIds.length == peers.length) {
        successln('[Received all IDs]: Terminating.');
    } else {
        errorln('[Error]: All IDs not received, terminating due to timeout.');
    }

    const index: number = peersAndIds.findIndex(([peer, _]) => peer == whoami);
    const id: number = peersAndIds[index][1];

    let leader: boolean = true;
    for (const peerAndId of peersAndIds) {
        const otherId: number = peerAndId[1];
        if (id < otherId) {
            leader = false;
        }
    }

    peersAndIds = []

    if (leader) {
        successln('[Elected as Leader]: Updating global model');
        performAggregation();
    }
}

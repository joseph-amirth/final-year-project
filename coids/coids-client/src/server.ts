import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import axios from 'axios';

import { globalModelUpdateRouter } from './global-model-update.router.js';
import { localModelAddRouter } from './local-model-add.router.js';
import { informRouter } from './inform.router.js';
import { displayRouter } from './display.router.js';
import { infoln, envOrDefault, errorln } from './utils.js';
import { getCollection } from './mongodb.js';

export async function startServer(): Promise<void> {
    const server = express();
    const port: number = parseInt(envOrDefault('CHAINCODE_API_PORT', '3000'));

    server.set('view engine', 'ejs');
    server.set('views', './src/views');

    server.use(express.json());
    server.use(express.urlencoded({
        extended: true,
    }));

    server.get('/', (_, response: Response) => {
        response.send('Chaincode API Server works!');
    });

    server.use('/api/globalmodel', globalModelUpdateRouter);
    server.use('/api/localmodel', localModelAddRouter);
    server.use('/api/inform', informRouter);

    server.post('/api/retrain', async (request: Request, response: Response) => {
        infoln(`Commencing retraining for anomaly ${request.body._id}`);

        axios.post('http://localhost:5000/api/retrain', request.body).then(
            response => {
                infoln(`Received response for retrain request: ${response.statusText}`);
            }, error => {
                errorln(`Received error for retrain request: ${error}`);
            });

        await getCollection('anomalies').deleteOne({ _id: new ObjectId(request.body._id) });
        response.redirect('/display/anomalies');
    });

    server.use('/display', displayRouter);

    server.listen(port, () => {
        infoln(`\nExample app listening on port ${port}`);
    });
}


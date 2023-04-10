import express, { Request, Response } from 'express';
import { globalModelUpdateRouter } from './global-model-update.router.js';
import { localModelAddRouter } from './local-model-add.router.js';
import { intrusionDetectionRouter } from './intrusion-detection.router.js';
import { infoln, envOrDefault } from './utils.js';

export async function startServer(): Promise<void> {
    const server = express();
    const port: number = parseInt(envOrDefault('CHAINCODE_API_PORT', '3000'));

    server.set('view engine', 'ejs');
    server.set('views', './src/views');

    server.use(express.json());
    server.use(express.urlencoded({
        extended: true,
    }));

    server.get('/', (request: Request, response: Response) => {
        response.send('Chaincode API Server works!');
    });

    server.use('/api/globalmodel', globalModelUpdateRouter);
    server.use('/api/localmodel', localModelAddRouter);
    server.use('/api/intrusion', intrusionDetectionRouter);

    server.listen(port, () => {
        infoln(`\nExample app listening on port ${port}`);
    });
}


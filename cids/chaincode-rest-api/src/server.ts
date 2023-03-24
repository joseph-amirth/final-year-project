/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { modelUpdateRouter } from './model-update.router.js';
import { modelUpdateRouterUI } from './model-update-ui.router.js';
import { infoln } from './utils.js';

export async function startServer(): Promise<void> {
    const server = express();
    const port = 3000;

    server.set("view engine","ejs");
    //server.set('views', './views');


    server.use(express.json());
    server.use(express.urlencoded({
        extended: true,
    }));

    server.get('/', (request: Request, response: Response) => {
        response.send('Rest API Server works!');
    });

    server.use('/api/model', modelUpdateRouter);
    server.use('/api/intrusion',modelUpdateRouterUI);

    server.listen(port, () => {
        infoln(`\nExample app listening on port ${port}`);
    });
}


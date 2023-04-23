/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { connectToDatabase } from './mongodb.js';
import { startServer } from './server.js';

import { getGateway } from './gateway.js';
import { initGlobalModel } from './global-model-update.js';
import { initLocalModels } from './local-model-add.js';

async function main(): Promise<void> {
    const channelName = 'mychannel';
    const chaincodeName = 'basic';

    // Get a gateway connection.
    const gateway = await getGateway();

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const GMUcontract = network.getContract(chaincodeName, 'GlobalModelUpdateContract');

        await initGlobalModel(GMUcontract);

        const LMAcontract = network.getContract(chaincodeName, 'LocalModelAddContract');

        await initLocalModels(LMAcontract);
    } finally {
        gateway.close();
    }
}

await main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

await connectToDatabase().catch(error => {
    console.error('******** FAILED to connect to the database:', error);
    process.exitCode = 1;
});

await startServer().catch(error => {
    console.error('******** FAILED to start the server:', error);
    process.exitCode = 1;
});

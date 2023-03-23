/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { startServer } from './server.js';

import { getGateway } from './gateway.js';
import { initModel, updateModel, getModel } from './model-update.js';

async function main(): Promise<void> {
    const channelName: string = 'mychannel';
    const chaincodeName: string = 'basic';

    // Get a gateway connection.
    const gateway = await getGateway();

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName, 'ModelUpdateContract');

        await initModel(contract);
    } finally {
        gateway.close();
    }
}

await main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

await startServer().catch(error => {
    console.error('******** FAILED to start the server:', error);
    process.exitCode = 1;
});


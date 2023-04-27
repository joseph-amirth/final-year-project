import { performance } from 'perf_hooks';
import { Contract } from '@hyperledger/fabric-gateway';

import { getGateway } from './gateway.js';
import { getGlobalModelCID, updateGlobalModelCID } from './global-model-update.js';
import { infoln } from './utils.js';

export async function testLatency(): Promise<void> {
    const channelName = 'mychannel';
    const chaincodeName = 'basic';

    const gateway = await getGateway();

    try {
        const network = gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName, 'GlobalModelUpdateContract');

        await testGetGlobalModelCID(contract);

        await testUpdateGlobalModelCID(contract);
    } finally {
        gateway.close();
    }
}

async function testGetGlobalModelCID(contract: Contract): Promise<void> {
    let totalTime = 0;
    const runs = 10;

    for (let i = 0; i < runs; i++) {
        const startTime = performance.now();
        await getGlobalModelCID(contract);
        const endTime = performance.now();
        totalTime += endTime - startTime;
    }

    infoln(`\nAverage latency of getGlobalModelCID (in ms): ${totalTime / runs}`);
}

async function testUpdateGlobalModelCID(contract: Contract): Promise<void> {
    let totalTime = 0;
    const runs = 10;

    for (let i = 0; i < runs; i++) {
        const startTime = performance.now();
        await updateGlobalModelCID(contract, `cid${i}`);
        const endTime = performance.now();
        totalTime += endTime - startTime;
    }

    infoln(`\nAverage latency of updateGlobalModelCID (in ms): ${totalTime / runs}`);
}

import { performance } from 'perf_hooks';
import { Contract } from '@hyperledger/fabric-gateway';

import { getGateway } from './gateway.js';
import { addLocalModel, popLocalModels } from './local-model-add.js';
import { infoln } from './utils.js';

export async function testLatency(): Promise<void> {
    const channelName = 'mychannel';
    const chaincodeName = 'basic';

    const gateway = await getGateway();

    try {
        const network = gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName, 'LocalModelAddContract');

        await testAddLocalModel(contract);

        for (const localModelCount of [1, 5, 10, 20]) {
            await testPopLocalModels(contract, localModelCount);
        }
    } finally {
        gateway.close();
    }
}

async function testAddLocalModel(contract: Contract): Promise<void> {
    let totalTime = 0;
    const runs = 5;

    for (let i = 0; i < runs; i++) {
        const startTime = performance.now();
        await addLocalModel(contract, 'prev', `now${i}`);
        const endTime = performance.now();
        totalTime += endTime - startTime;
    }

    infoln(`\nAverage latency of addLocalModel (in ms): ${totalTime / runs}`);
}

async function testPopLocalModels(contract: Contract, localModelCount: number): Promise<void> {
    let totalTime = 0;
    const runs = 5;

    for (let i = 0; i < runs; i++) {
        for (let j = 0; j < localModelCount; j++) {
            await addLocalModel(contract, 'prev', `now${i}`);
        }
        const startTime = performance.now();
        await popLocalModels(contract);
        const endTime = performance.now();
        totalTime += endTime - startTime;
    }

    infoln(`\nAverage latency of popLocalModels for ${localModelCount} local models (in ms): ${totalTime / runs}`);
}

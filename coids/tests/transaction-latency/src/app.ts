import { getGateway } from './gateway.js';

import { initGlobalModel } from './global-model-update.js';
import { initLocalModels } from './local-model-add.js';

import { testLatency as testGlobaModelTransactionLatency } from './global-model-update.tests.js';
import { testLatency as testLocalModelTransactionLatency } from './local-model-add.tests.js';

async function main(): Promise<void> {
    const channelName = 'mychannel';
    const chaincodeName = 'basic';

    const gateway = await getGateway();

    try {
        const network = gateway.getNetwork(channelName);

        const GMUcontract = network.getContract(chaincodeName, 'GlobalModelUpdateContract');

        await initGlobalModel(GMUcontract);

        const LMAcontract = network.getContract(chaincodeName, 'LocalModelAddContract');

        await initLocalModels(LMAcontract);
    } finally {
        gateway.close();
    }
}

await main().catch(error => {
    console.error('******** FAILED to initialize local models:', error);
    process.exitCode = 1;
});

await testGlobaModelTransactionLatency().catch(error => {
    console.error('******** FAILED to test global model transaction latency:', error);
    process.exitCode = 1;
});

await testLocalModelTransactionLatency().catch(error => {
    console.error('******** FAILED to test local model transaction latency:', error);
    process.exitCode = 1;
});

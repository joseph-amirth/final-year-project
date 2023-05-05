import axios from 'axios';

import { infoln, successln, errorln } from "./utils.js";
import { getGateway } from './gateway.js';
import { popLocalModels } from "./local-model-add.js";
import { updateGlobalModelCID } from './global-model-update.js';

const gateway = await getGateway();

const network = gateway.getNetwork('mychannel');

const globalModelContract = network.getContract('basic', 'GlobalModelUpdateContract');
const localModelContract = network.getContract('basic', 'LocalModelAddContract');

export async function performAggregation() {
    infoln('[Updating Global Model]: Getting local models.');

    const localModels = await popLocalModels(localModelContract);

    infoln('[Updating Global Model]: Retrieved local models.');
    infoln('[Updating Global Model]: Commencing model aggregation.');

    axios.post('http://host.docker.internal:5000/api/aggregate', localModels).then(
        async response => {
            const cid = response.data;
            infoln(`[Updating Global Model]: Model aggregation successful.`);
            await updateGlobalModelCID(globalModelContract, cid);
            successln('[Updating Global Model]: Successfully submitted global model update transaction.');
        },
        error => {
            errorln(`[Updating Global Model]: Error during aggregation: ${error}`);
        }
    );
}

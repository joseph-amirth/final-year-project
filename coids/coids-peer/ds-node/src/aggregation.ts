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
    infoln('[Updating Global Model]: Starting model aggregation');

    const localModels = await popLocalModels(localModelContract);

    infoln(`[Retrieved Local Models]: ${localModels}`);

    axios.post('http://host.docker.internal:5000/api/aggregate', localModels).then(
        async response => {
            const cid = response.data;
            infoln(`[Retrieved Updated Global Model CID]: ${cid}`);
            successln('[Updated Global Model]: Submitted transaction');
        },
        error => {
            errorln(`Error during aggregation: ${error}`);
        }
    );
}

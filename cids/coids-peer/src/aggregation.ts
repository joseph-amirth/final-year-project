import axios from 'axios';

import { infoln, successln } from "./utils.js";
import { getGateway } from './gateway.js';
import { popLocalModels } from "./local-model-add.js";
import { updateGlobalModelCID } from './global-model-update.js';

const gateway = await getGateway();

const network = gateway.getNetwork('mychannel');

const globalModelContract = network.getContract('UpdateGlobalModelContract');
const localModelContract = network.getContract('LocalModelAddContract');

export async function performAggregation() {
    infoln('[Updating Global Model]: Starting model aggregation');

    const localModels = await popLocalModels(localModelContract);

    const response = await axios.post('http://localhost:5000/api/aggregate', localModels);

    const cid = response.data;

    await updateGlobalModelCID(globalModelContract, cid);

    successln('[Updated Global Model]: Submitted transaction');
}

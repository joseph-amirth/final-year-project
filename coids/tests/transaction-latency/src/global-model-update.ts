/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';
import { infoln, successln } from './utils.js';

const utf8Decoder = new TextDecoder();

export async function initGlobalModel(contract: Contract): Promise<void> {
    infoln('\n--> Submitting InitGlobalModel transaction');
    await contract.submitTransaction('InitGlobalModel');
    successln('*** Transaction committed successfully');
}

export async function updateGlobalModelCID(contract: Contract, CID: string): Promise<void> {
    await contract.submitTransaction(
        'UpdateGlobalModel',
        CID,
    );
}

export async function getGlobalModelCID(contract: Contract): Promise<string> {
    const bytes: Uint8Array = await contract.evaluateTransaction('GetGlobalModel');
    const json: string = utf8Decoder.decode(bytes);
    const globalModel = JSON.parse(json);
    return globalModel.CID;
}

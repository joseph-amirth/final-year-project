/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';
import { infoln, successln } from './utils.js';

const utf8Decoder = new TextDecoder();

export async function initLocalModels(contract: Contract): Promise<void> {
    infoln('\n--> Submitting initLocalModels transaction');
    await contract.submitTransaction('InitLocalModels');
    successln('*** Successfully submitted initLocalModels transaction');
}

export async function getLocalModelCount(contract: Contract): Promise<number> {
    const bytes = await contract.evaluateTransaction('GetLocalModelCount');
    const json = utf8Decoder.decode(bytes);
    const localModelCount = JSON.parse(json);
    return localModelCount;
}

export async function addLocalModel(contract: Contract, prevCID: string, CID: string): Promise<void> {
    await contract.submitTransaction(
        'AddLocalModel',
        prevCID,
        CID,
    );
}

export async function getLocalModels(contract: Contract): Promise<JSON> {
    const bytes = await contract.evaluateTransaction('GetLocalModels');
    const json = utf8Decoder.decode(bytes);
    const localModels = JSON.parse(json);
    return localModels;
}

export async function popLocalModels(contract: Contract): Promise<JSON> {
    const bytes = await contract.submitTransaction('PopLocalModels');
    const json = utf8Decoder.decode(bytes);
    const localModels = JSON.parse(json);
    return localModels;
}


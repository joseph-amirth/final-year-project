/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';
import { infoln, successln } from './utils.js';

import { create as ipfsCreate } from 'ipfs-core';
import all from 'it-all';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';

const utf8Decoder = new TextDecoder();

// IPFS connection.
const ipfs = await ipfsCreate();

export async function initGlobalModel(contract: Contract): Promise<void> {
    infoln('\n--> Submitting InitGlobalModel transaction');
    await contract.submitTransaction('InitGlobalModel');
    successln('*** Transaction committed successfully');
}

export async function updateGlobalModelCID(contract: Contract, CID: string): Promise<void> {
    infoln('\n--> Submitting UpdateGlobalModel transaction');
    await contract.submitTransaction(
        'UpdateGlobalModel',
        CID,
    );
    successln('*** Transaction committed successfully');
}

export async function updateGlobalModel(contract: Contract, modelStr: string): Promise<string> {
    infoln('--> Inserting model into IPFS');

    const result = await ipfs.add(modelStr);
    const CID = result.cid.toString();

    successln(`CID of the model: ${CID}`);

    await updateGlobalModelCID(contract, CID);

    return CID;
}

export async function getGlobalModelCID(contract: Contract): Promise<string> {
    const bytes: Uint8Array = await contract.evaluateTransaction('GetGlobalModel');
    const json: string = utf8Decoder.decode(bytes);
    const globalModel = JSON.parse(json);
    return globalModel.CID;
}

export async function getGlobalModel(contract: Contract): Promise<string> {
    const CID: string = await getGlobalModelCID(contract);
    const modelStr = uint8ArrayConcat(await all(ipfs.cat(CID)));
    return uint8ArrayToString(modelStr);
}


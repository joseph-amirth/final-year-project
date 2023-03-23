/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';
import { println, errorln, infoln, successln, warnln, fatalln } from './utils.js';

import { create as ipfsCreate } from 'ipfs-core';
import all from 'it-all';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';

const utf8Decoder = new TextDecoder();

// IPFS connection.
const ipfs = await ipfsCreate();

export async function initModel(contract: Contract): Promise<void> {
    infoln('\n--> Submitting InitModel transaction');
    await contract.submitTransaction('InitModel');
    successln('*** Transaction committed successfully');
}

export async function updateModel(contract: Contract, modelStr: string): Promise<string> {
    infoln('\n--> Submitting UpdateModel transaction');

    infoln('--> Inserting model into IPFS');

    const result = await ipfs.add(modelStr);
    const cid = result.cid.toString();

    successln(`CID of the new model: ${cid}`);

    await contract.submitTransaction(
        'UpdateModel',
        cid,
    );

    successln('*** Transaction committed successfully');
    return cid;
}

export async function getModel(contract: Contract): Promise<string> {
    infoln('\n--> Getting the model CID');

    const resultBytes = await contract.evaluateTransaction('GetModel');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);

    const cid: string = result.CID;

    successln(`*** Model CID: ${cid}`);

    const modelString = uint8ArrayConcat(await all(ipfs.cat(cid)));
    return uint8ArrayToString(modelString);
}

